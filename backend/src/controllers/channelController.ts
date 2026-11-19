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

      const amount = plan.prices[billingPeriod];
      const providerRef = `MN-CH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const payment = new ChannelPayment({
        channelId: channel._id.toString(),
        ownerId: req.user!.id,
        planId: plan.id,
        planName: plan.name,
        billingPeriod,
        amount,
        currency: 'RWF',
        status: 'pending',
        provider: process.env.PAYMENT_GATEWAY_URL ? 'gateway' : 'flutterwave-sandbox',
        providerRef,
      });

      // Hosted-checkout URL. With a real PAYMENT_GATEWAY_URL this is the URL
      // returned by the provider's "create checkout session" API.
      const gatewayUrl = process.env.PAYMENT_GATEWAY_URL?.trim();
      payment.checkoutUrl =
        gatewayUrl
          ? `${gatewayUrl.replace(/\/$/, '')}/checkout?ref=${providerRef}&amount=${amount}&currency=RWF`
          : `https://checkout.flutterwave.com/sandbox?ref=${providerRef}&amount=${amount}&currency=RWF`;

      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/channels/payments/:ref/confirm — the payment provider (or the
   * station returning from hosted checkout) confirms the charge. Only here is
   * the subscription activated.
   */
  confirmPayment: async (req: AuthRequest, res: Response) => {
    try {
      const payment = await ChannelPayment.findOne({ providerRef: req.params.ref });
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      if (payment.ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'Not your payment.' });
      }
      if (payment.status === 'confirmed') {
        return res.json(payment);
      }

      // In production this endpoint is called by the provider's webhook after
      // signature verification. Here the owner confirms after hosted checkout.
      payment.status = 'confirmed';
      await payment.save();

      const channel = await Channel.findById(payment.channelId);
      if (channel) {
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
      }

      res.json(payment);
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
      channel.subscription.status = 'canceled';
      await channel.save();
      res.json(publicChannel(channel));
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
