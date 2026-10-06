import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

// Mock auth.api.getSession
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock DB
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const createQueryBuilder = () => {
  const builder = {
    from: () => builder,
    where: () => builder,
    orderBy: () => Promise.resolve(mockSelect()),
    limit: (...args: unknown[]) => Promise.resolve(mockSelect(...args)),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(mockSelect()).then(resolve),
  };
  return builder;
};

vi.mock("@/db", () => ({
  db: {
    select: () => createQueryBuilder(),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(mockInsert()),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve(mockUpdate()),
        }),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve(mockDelete()),
    }),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  isProProfile,
  canPublishMoreProjects,
  canHideBranding,
} from "@/features/billing/subscription-service";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";
import { updatePortfolioSettingsAction } from "@/features/design/actions";
import { createProjectAction, toggleProjectPublishAction } from "@/features/projects/actions";

describe("GoWider V2 Billing & Pro Tier Gates", () => {
  const mockUser = { id: "user_test_123", email: "director@gowider.test", role: "creator" };
  const mockProfile = {
    id: "profile_test_123",
    userId: mockUser.id,
    username: "director",
    displayName: "Director Test",
    isPublished: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockReturnValue({
      user: mockUser,
      session: {
        id: "sess_123",
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
  });

  describe("Subscription Service & Pro Status", () => {
    it("returns false for isProProfile when profile has no subscription", async () => {
      mockSelect.mockReturnValue([]);
      const isPro = await isProProfile("profile_test_123");
      expect(isPro).toBe(false);
    });

    it("returns true for isProProfile when active pro subscription exists", async () => {
      mockSelect.mockReturnValue([
        {
          id: "sub_1",
          profileId: "profile_test_123",
          plan: "pro",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 1000000),
        },
      ]);
      const isPro = await isProProfile("profile_test_123");
      expect(isPro).toBe(true);
    });

    it("returns false for isProProfile when pro subscription is canceled or expired", async () => {
      mockSelect.mockReturnValue([
        {
          id: "sub_1",
          profileId: "profile_test_123",
          plan: "pro",
          status: "cancelled",
          currentPeriodEnd: new Date(Date.now() - 1000000),
        },
      ]);
      const isPro = await isProProfile("profile_test_123");
      expect(isPro).toBe(false);
    });
  });

  describe("Gate 1: Project Publication Cap (Free 6 vs Pro Unlimited)", () => {
    it("allows publication on Free tier when published count is under 6", async () => {
      mockSelect.mockReturnValue([]); // No pro subscription
      const check = await canPublishMoreProjects("profile_test_123", 4);
      expect(check.allowed).toBe(true);
      expect(check.maxAllowed).toBe(6);
      expect(check.isPro).toBe(false);
    });

    it("blocks publication on Free tier when published count is 6 or more", async () => {
      mockSelect.mockReturnValue([]); // No pro subscription
      const check = await canPublishMoreProjects("profile_test_123", 6);
      expect(check.allowed).toBe(false);
      expect(check.maxAllowed).toBe(6);
      expect(check.isPro).toBe(false);
      expect(check.message).toContain("limited to 6 published projects");
    });

    it("allows publication on Pro tier even when published count exceeds 6", async () => {
      mockSelect.mockReturnValue([
        {
          id: "sub_1",
          profileId: "profile_test_123",
          plan: "pro",
          status: "active",
        },
      ]);
      const check = await canPublishMoreProjects("profile_test_123", 12);
      expect(check.allowed).toBe(true);
      expect(check.maxAllowed).toBe(Infinity);
      expect(check.isPro).toBe(true);
    });
  });

  describe("Gate 2: Branding Watermark Removal", () => {
    it("blocks hiding branding for free tier users", async () => {
      mockSelect.mockReturnValue([]); // Free tier
      const check = await canHideBranding("profile_test_123");
      expect(check.allowed).toBe(false);
      expect(check.isPro).toBe(false);
    });

    it("allows hiding branding for active pro users", async () => {
      mockSelect.mockReturnValue([
        {
          id: "sub_1",
          profileId: "profile_test_123",
          plan: "pro",
          status: "active",
        },
      ]);
      const check = await canHideBranding("profile_test_123");
      expect(check.allowed).toBe(true);
      expect(check.isPro).toBe(true);
    });

    it("rejects updatePortfolioSettingsAction with hideBranding: true when user is on Free tier", async () => {
      // 1. requireProfileOwner -> [mockProfile]
      // 2. getProfileSubscription -> [] (Free)
      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([]);

      const result = await updatePortfolioSettingsAction("profile_test_123", {
        theme: "cinema",
        motionLevel: "full",
        accentColor: "#E5E5E5",
        hideBranding: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Removing GoWider branding is a Pro tier feature");
      }
    });

    it("rejects updatePortfolioSettingsAction with theme: 'noir' when user is on Free tier", async () => {
      // 1. requireProfileOwner -> [mockProfile]
      // 2. getProfileSubscription -> [] (Free)
      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([]);

      const result = await updatePortfolioSettingsAction("profile_test_123", {
        theme: "noir",
        motionLevel: "full",
        accentColor: "#F59E0B",
        hideBranding: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Noir theme is exclusive to GoWider Pro creators");
      }
    });

    it("rejects updatePortfolioSettingsAction with theme: 'vogue' when user is on Free tier", async () => {
      // 1. requireProfileOwner -> [mockProfile]
      // 2. getProfileSubscription -> [] (Free)
      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([]);

      const result = await updatePortfolioSettingsAction("profile_test_123", {
        theme: "vogue",
        motionLevel: "full",
        accentColor: "#EFE3C3",
        hideBranding: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Vogue theme is exclusive to GoWider Pro creators");
      }
    });

    it("allows updatePortfolioSettingsAction with theme: 'noir' when user has active Pro subscription", async () => {
      const activeProSub = {
        id: "sub_1",
        profileId: "profile_test_123",
        plan: "pro",
        status: "active",
      };
      const existingSettings = {
        id: "ps_1",
        profileId: "profile_test_123",
        theme: "cinema",
        hideBranding: false,
      };
      const updatedSettings = {
        id: "ps_1",
        profileId: "profile_test_123",
        theme: "noir",
        motionLevel: "full",
        accentColor: "#F59E0B",
        hideBranding: false,
      };

      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([activeProSub])
        .mockReturnValueOnce([existingSettings]);
      mockUpdate.mockReturnValueOnce([updatedSettings]);

      const result = await updatePortfolioSettingsAction("profile_test_123", {
        theme: "noir",
        motionLevel: "full",
        accentColor: "#F59E0B",
        hideBranding: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe("noir");
      }
    });
  });

  describe("Razorpay Signature Verification", () => {
    const secret = "test_webhook_secret_key";

    it("verifies valid HMAC-SHA256 payment signature", () => {
      const orderId = "order_123456";
      const paymentId = "pay_789101";
      const paymentSecret = "test_payment_secret_123";
      const payload = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac("sha256", paymentSecret)
        .update(payload)
        .digest("hex");

      const isValid = verifyRazorpayPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        secret: paymentSecret,
      });

      expect(isValid).toBe(true);
    });

    it("rejects tampered payment signature", () => {
      const isValid = verifyRazorpayPaymentSignature({
        razorpayOrderId: "order_123456",
        razorpayPaymentId: "pay_789101",
        razorpaySignature: "invalid_tampered_signature",
      });

      expect(isValid).toBe(false);
    });

    it("verifies valid webhook signature", () => {
      const body = JSON.stringify({ event: "subscription.activated", id: "evt_123" });
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const isValid = verifyRazorpayWebhookSignature(body, validSignature, secret);
      expect(isValid).toBe(true);
    });

    it("rejects invalid webhook signature", () => {
      const body = JSON.stringify({ event: "subscription.activated", id: "evt_123" });
      const isValid = verifyRazorpayWebhookSignature(body, "bad_signature", secret);
      expect(isValid).toBe(false);
    });
  });

  describe("Server Action Enforcement: Project Publishing", () => {
    it("blocks publishing 7th project in createProjectAction when Free user hits cap", async () => {
      // 1. select profile by session.user.id -> [mockProfile]
      // 2. select existingSlug for explicit slug -> []
      // 3. select maxOrder -> [{ maxOrder: 5 }]
      // 4. select count of published projects -> [{ count: 6 }]
      // 5. getProfileSubscription -> [] (Free)
      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([{ maxOrder: 5 }])
        .mockReturnValueOnce([{ count: 6 }])
        .mockReturnValueOnce([]);

      const res = await createProjectAction({
        profileId: mockProfile.id,
        title: "Project Seven",
        slug: "project-seven",
        category: "Commercial",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        year: 2026,
        isPublished: true,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Free plan is limited to 6 published projects");
      }
    });

    it("allows creating a draft project in createProjectAction even if Free user is at 6 published projects", async () => {
      // 1. select profile by session.user.id -> [mockProfile]
      // 2. select existingSlug for explicit slug -> []
      // 3. select maxOrder -> [{ maxOrder: 5 }]
      mockSelect
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([{ maxOrder: 5 }]);

      mockInsert.mockReturnValueOnce([
        {
          id: "p7",
          title: "Draft Project Seven",
          isPublished: false,
        },
      ]);

      const res = await createProjectAction({
        profileId: mockProfile.id,
        title: "Draft Project Seven",
        slug: "draft-project-seven",
        category: "Commercial",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        year: 2026,
        isPublished: false, // Draft is allowed
      });

      expect(res.success).toBe(true);
    });

    it("blocks toggleProjectPublishAction to true when Free user is at 6 published projects", async () => {
      const existingDraftProject = {
        id: "proj_draft",
        profileId: mockProfile.id,
        isPublished: false,
      };

      // 1. select project by id -> [existingDraftProject]
      // 2. requireProfileOwner -> [mockProfile]
      // 3. select count of published projects -> [{ count: 6 }]
      // 4. getProfileSubscription -> [] (Free)
      mockSelect
        .mockReturnValueOnce([existingDraftProject])
        .mockReturnValueOnce([mockProfile])
        .mockReturnValueOnce([{ count: 6 }])
        .mockReturnValueOnce([]);

      const res = await toggleProjectPublishAction("proj_draft");

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("Free plan is limited to 6 published projects");
      }
    });
  });
});
