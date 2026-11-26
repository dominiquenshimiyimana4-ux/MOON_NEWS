import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Channel, { IChannel } from '../models/Channel';
import ChannelPayment from '../models/ChannelPayment';
import User from '../models/User';

/* ------------------------- Station channel plans ------------------------- */
/* Prices in RWF. Yearly billing carries a ~2-month discount.               */
export const CHANNEL_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    prices: { monthly: 25000, yearly: 250000 },
    features: [
      'Channel listing on Moon News',
      'Stream link on your channel page',
      'Basic station profile',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    prices: { monthly: 60000, yearly: 600000 },
    features: [
      'Everything in Starter',
      'Featured placement in the channel directory',
      'Programme schedule section',
      'Priority review of updates',
      'Monthly audience report',
    ],
  },
  {
    id: 'broadcast',
    name: 'Broadcast Pro',
    prices: { monthly: 120000, yearly: 1200000 },
    features: [
      'Everything in Growth',
      'Homepage spotlight rotation',
      'Embedded live player on Moon News',
      'Breaking-news cross promotion',
      'Dedicated account manager',
    ],
  },
] as const;

export type PlanId = (typeof CHANNEL_PLANS)[number]['id'];

function findPlan(planId: string) {
  return CHANNEL_PLANS.find((p) => p.id === planId);
}

function publicChannel(ch: IChannel) {
  return {
    id: ch._id.toString(),
    ownerId: ch.ownerId,
    stationName: ch.stationName,
    logo: ch.logo,
    type: ch.type,
    description: ch.description,
    location: ch.location,
    streamUrl: ch.streamUrl,
    status: ch.status,
    adminManaged: ch.adminManaged ?? false,
    reviewNote: ch.reviewNote,
    subscription: ch.subscription,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
  };
}

const URL_RE = /^https?:\/\/.+\..+/i;

/** Server-side validation shared by create and update. */
function validateChannelInput(body: Record<string, unknown>) {
  const errors: string[] = [];
  const stationName = String(body.stationName ?? '').trim();
  const type = String(body.type ?? '').trim();
  const description = String(body.description ?? '').trim();
  const location = String(body.location ?? '').trim();
  const streamUrl = String(body.streamUrl ?? '').trim();
  const logo = String(body.logo ?? '').trim();

  if (stationName.length < 2 || stationName.length > 80) {
    errors.push('Station name must be between 2 and 80 characters.');
  }
  if (type !== 'radio' && type !== 'television') {
    errors.push('Channel type must be "radio" or "television".');
  }
  if (description.length < 20 || description.length > 1000) {
    errors.push('Description must be between 20 and 1000 characters.');
  }
  if (location.length < 2 || location.length > 80) {
    errors.push('Location must be between 2 and 80 characters.');
  }
  if (!URL_RE.test(streamUrl)) {
    errors.push('Streaming/website link must be a valid http(s) URL.');
  }
  if (logo && !URL_RE.test(logo)) {
    errors.push('Logo must be a valid http(s) URL.');
  }

  return {
    errors,
    values: { stationName, type, description, location, streamUrl, logo: logo || undefined },
  };
}

/* ------------------------------ Controllers ------------------------------ */

export const channelController = {
  /** GET /api/channels — public directory of active channels. */
  listPublic: async (req: AuthRequest, res: Response) => {
    try {
      const channels = await Channel.find({
        status: 'approved',
        $or: [{ adminManaged: true }, { 'subscription.status': 'active' }],
      }).sort({ createdAt: -1 });
      res.json(channels.map(publicChannel));
    } catch (error) {
      console.error('List channels error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** GET /api/channels/mine — the signed-in station's channel + payments. */
  getMine: async (req: AuthRequest, res: Response) => {
    try {
      const channel = await Channel.findOne({ ownerId: req.user!.id });
      const payments = await ChannelPayment.find({ ownerId: req.user!.id }).sort({ createdAt: -1 });
      res.json({
        channel: channel ? publicChannel(channel) : null,
        payments,
        plans: CHANNEL_PLANS,
      });
    } catch (error) {
      console.error('Get my channel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** POST /api/channels — station registers its channel (status: pending). */
  create: async (req: AuthRequest, res: Response) => {
    try {
      const existing = await Channel.findOne({ ownerId: req.user!.id });
      if (existing) {
        return res.status(409).json({ error: 'You already registered a channel. Manage it from your dashboard.' });
      }

      const { errors, values } = validateChannelInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      const channel = new Channel({ ...values, ownerId: req.user!.id, status: 'pending', adminManaged: false });
      await channel.save();
      res.status(201).json(publicChannel(channel));
    } catch (error) {
      console.error('Create channel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** PATCH /api/channels/mine — station edits its own details. */
  updateMine: async (req: AuthRequest, res: Response) => {
    try {
      const channel = await Channel.findOne({ ownerId: req.user!.id });
      if (!channel) return res.status(404).json({ error: 'Channel not found' });

      const { errors, values } = validateChannelInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      Object.assign(channel, values);
      // Content edits go back to review only if the channel was rejected.
      if (channel.status === 'rejected') channel.status = 'pending';
      await channel.save();
      res.json(publicChannel(channel));
    } catch (error) {
      console.error('Update channel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** PATCH /api/channels/:id/review — administrator approves or rejects. */
  review: async (req: AuthRequest, res: Response) => {
    try {
      const { decision, note } = req.body as { decision?: string; note?: string };
      if (decision !== 'approved' && decision !== 'rejected') {
        return res.status(400).json({ error: 'decision must be "approved" or "rejected"' });
      }
      if (decision === 'rejected' && !note?.trim()) {
        return res.status(400).json({ error: 'A note is required when rejecting a channel.' });
      }

      const channel = await Channel.findById(req.params.id);
      if (!channel) return res.status(404).json({ error: 'Channel not found' });

      channel.status = decision;
      channel.adminManaged = false;
      channel.reviewNote = decision === 'rejected' ? note!.trim() : undefined;
      channel.reviewedBy = req.user!.id;
      channel.reviewedAt = new Date();
      await channel.save();
      res.json(publicChannel(channel));
    } catch (error) {
      console.error('Review channel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** POST /api/channels/admin — add and immediately publish an administrator-managed channel. */
  createAdmin: async (req: AuthRequest, res: Response) => {
    try {
      const { errors, values } = validateChannelInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0], errors });
      }

      const channel = new Channel({
        ...values,
        // Admin-managed public channels do not belong to a station account.
        // Give each a distinct owner key because station accounts have a unique owner index.
        ownerId: `admin:${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        status: 'approved',
        adminManaged: true,
        subscription: { status: 'none', plan: null, planName: null, billingPeriod: null },
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      });
      await channel.save();
      res.status(201).json(publicChannel(channel));
    } catch (error) {
      console.error('Admin create channel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** GET /api/channels/admin/all — administrator queue. */
  listAll: async (req: AuthRequest, res: Response) => {
    try {
      const channels = await Channel.find().sort({ createdAt: -1 });
      res.json(channels.map(publicChannel));
    } catch (error) {
      console.error('Admin list channels error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/channels/subscribe — creates a checkout session with the secure
   * payment provider. No card details ever touch this server: the station is
   * redirected to the provider's hosted checkout page.
   */
  subscribe: async (req: AuthRequest, res: Response) => {
    try {
      const { planId, billingPeriod } = req.body as {
        planId?: string;
        billingPeriod?: string;
      };

      const plan = planId ? findPlan(planId) : undefined;
      if (!plan) return res.status(400).json({ error: 'Unknown plan.' });
      if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
        return res.status(400).json({ error: 'billingPeriod must be "monthly" or "yearly".' });
      }

      const channel = await Channel.findOne({ ownerId: req.user!.id });
      if (!channel) return res.status(404).json({ error: 'Register your channel first.' });
      if (channel.status !== 'approved') {
        return res.status(403).json({ error: 'Your channel must be approved by an administrator before subscribing.' });
      }
      if (channel.adminManaged) {
        return res.status(403).json({ error: 'Admin-managed channels cannot subscribe to a station plan.' });
      }

      const amount = plan.prices[billingPeriod];
      const providerRef = `MN-CH-${randomUUID()}`;
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY?.trim();
      const frontendUrl = (process.env.FRONTEND_URL || '').split(',')[0].trim().replace(/\/+$/, '');
      if (!secretKey || !frontendUrl) {
        return res.status(503).json({ error: 'Payment checkout is not configured.' });
      }

      const user = await User.findById(req.user!.id).select('name email');
      if (!user) return res.status(404).json({ error: 'Station account not found.' });

      const checkoutResponse = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          tx_ref: providerRef,
          amount,
          currency: 'RWF',
          redirect_url: `${frontendUrl}/station/plans`,
          customer: { email: user.email, name: user.name },
          customizations: { title: 'Moon News Channel Subscription', description: plan.name },
          configuration: { session_duration: 30, max_retry_attempt: 3 },
          meta: { ownerId: user.id, channelId: channel._id.toString(), planId: plan.id },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!checkoutResponse.ok) {
        console.error('Payment provider checkout failed:', checkoutResponse.status);
        return res.status(502).json({ error: 'Could not start checkout with the payment provider.' });
      }

      const checkoutResult = (await checkoutResponse.json()) as {
        status?: string;
        data?: { link?: string };
      };
      if (checkoutResult.status !== 'success' || !checkoutResult.data?.link) {
        console.error('Payment provider returned an invalid checkout response.');
        return res.status(502).json({ error: 'The payment provider did not return a checkout link.' });
      }

      const payment = new ChannelPayment({
        channelId: channel._id.toString(),
        ownerId: req.user!.id,
        planId: plan.id,
        planName: plan.name,
        billingPeriod,
        amount,
        currency: 'RWF',
        status: 'pending',
        provider: 'flutterwave',
        providerRef,
        checkoutUrl: checkoutResult.data.link,
      });

      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/channels/payments/:ref/confirm — verifies the Flutterwave
   * transaction server-to-server before activating a subscription.
   */
  confirmPayment: async (req: AuthRequest, res: Response) => {
    try {
      const payment = await ChannelPayment.findOne({ providerRef: req.params.ref });
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      if (payment.ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'Not your payment.' });
      }
      if (payment.status === 'confirmed') {
        const confirmedTransactionId = req.body?.transactionId;
        if (
          confirmedTransactionId &&
          String(confirmedTransactionId) !== payment.providerTransactionId
        ) {
          return res.status(409).json({ error: 'Transaction does not match this payment.' });
        }
        return res.json(payment);
      }

      // Never trust the browser redirect as proof of payment. The only payment
      // provider that is currently implemented is Flutterwave, so sandbox
      // payments remain pending until its transaction verification succeeds.
      if (payment.provider !== 'flutterwave') {
        return res.status(503).json({ error: 'Payment provider verification is not configured.' });
      }

      const transactionId = req.body?.transactionId;
      if (typeof transactionId !== 'string' && typeof transactionId !== 'number') {
        return res.status(400).json({ error: 'A valid Flutterwave transactionId is required.' });
      }
      const transactionIdString = String(transactionId);
      if (!/^\d+$/.test(transactionIdString)) {
        return res.status(400).json({ error: 'A valid Flutterwave transactionId is required.' });
      }

      const apiKey = process.env.FLUTTERWAVE_SECRET_KEY?.trim();
      if (!apiKey) {
        return res.status(503).json({ error: 'Payment verification is not configured.' });
      }

      const verification = await fetch(
        `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionIdString)}/verify`,
        {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!verification.ok) {
        console.error('Payment provider verification failed:', verification.status);
        return res.status(502).json({ error: 'Could not verify payment with the provider.' });
      }

      const result = (await verification.json()) as {
        status?: string;
        data?: {
          id?: number;
          status?: string;
          tx_ref?: string;
          customer?: { email?: string };
          amount?: number;
          currency?: string;
        };
      };
      const station = await User.findById(payment.ownerId).select('email');
      if (
        !station ||
        result.status !== 'success' ||
        result.data?.status !== 'successful' ||
        result.data.tx_ref !== payment.providerRef ||
        String(result.data.id) !== transactionIdString ||
        String(result.data.customer?.email ?? '').trim().toLowerCase() !== station.email.toLowerCase() ||
        Number(result.data.amount) !== payment.amount ||
        result.data.currency !== payment.currency ||
        !result.data.id
      ) {
        return res.status(402).json({ error: 'The provider has not verified this payment.' });
      }

      const channel = await Channel.findOne({ _id: payment.channelId, ownerId: payment.ownerId });
      if (!channel) return res.status(404).json({ error: 'Channel not found.' });

      // Conditional update makes duplicate confirmation requests idempotent and
      // prevents a concurrent request from replacing a newer subscription.
      const confirmedPayment = await ChannelPayment.findOneAndUpdate(
        { _id: payment._id, status: 'pending' },
        { $set: { status: 'confirmed', providerTransactionId: String(result.data.id) } },
        { new: true },
      );
      if (!confirmedPayment) {
        const currentPayment = await ChannelPayment.findById(payment._id);
        if (currentPayment?.status === 'confirmed') return res.json(currentPayment);
        return res.status(409).json({ error: 'Payment status changed. Please refresh and try again.' });
      }

      const days = payment.billingPeriod === 'yearly' ? 365 : 30;
      channel.subscription = {
        status: 'active',
        plan: payment.planId,
        planName: payment.planName,
        billingPeriod: payment.billingPeriod,
        startedAt: new Date(),
        renewsAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      };
      await channel.save();

      res.json(confirmedPayment);
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /** DELETE /api/channels/mine/subscription — cancel at period end. */
  cancelSubscription: async (req: AuthRequest, res: Response) => {
    try {
      const channel = await Channel.findOne({ ownerId: req.user!.id });
      if (!channel) return res.status(404).json({ error: 'Channel not found' });
      if (channel.adminManaged) {
        return res.status(403).json({ error: 'Admin-managed channels do not have station subscriptions.' });
      }
      channel.subscription.status = 'canceled';
      await channel.save();
      res.json(publicChannel(channel));
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
