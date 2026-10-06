"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { ProfileWithAuxiliary } from "@/features/profile";
import {
  updateProfileAction,
  manageServicesAction,
  manageSkillsAction,
  manageSocialLinksAction,
} from "@/features/profile/actions";
import { SOCIAL_PLATFORMS } from "@/features/profile/validation";

interface ProfileEditorProps {
  initialData: ProfileWithAuxiliary;
}

export function ProfileEditor({ initialData }: ProfileEditorProps) {
  const router = useRouter();

  // Identity state
  const [displayName, setDisplayName] = useState(initialData.profile.displayName);
  const [headline, setHeadline] = useState(initialData.profile.headline);
  const [location, setLocation] = useState(initialData.profile.location || "");
  const [bio, setBio] = useState(initialData.profile.bio || "");
  const [availability, setAvailability] = useState(initialData.profile.availability || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.profile.avatarUrl || "");

  // Auxiliary state
  const [services, setServices] = useState<Array<{ name: string }>>(
    initialData.services.map((s) => ({ name: s.name }))
  );
  const [newServiceName, setNewServiceName] = useState("");

  const [skills, setSkills] = useState<Array<{ name: string }>>(
    initialData.skills.map((s) => ({ name: s.name }))
  );
  const [newSkillName, setNewSkillName] = useState("");

  const [socialLinks, setSocialLinks] = useState<
    Array<{ platform: (typeof SOCIAL_PLATFORMS)[number]; url: string }>
  >(
    initialData.socialLinks.map((sl) => ({
      platform: sl.platform as (typeof SOCIAL_PLATFORMS)[number],
      url: sl.url,
    }))
  );
  const [newPlatform, setNewPlatform] =
    useState<(typeof SOCIAL_PLATFORMS)[number]>("instagram");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  // Feedback states
  const [identityMsg, setIdentityMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [servicesMsg, setServicesMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [skillsMsg, setSkillsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [socialMsg, setSocialMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Save Identity
  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityMsg(null);

    startTransition(async () => {
      const res = await updateProfileAction(initialData.profile.id, {
        displayName: displayName.trim(),
        headline: headline.trim(),
        location: location.trim() || null,
        bio: bio.trim() || null,
        availability: availability.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });

      if (res.success) {
        setIdentityMsg({ type: "success", text: "Identity updated successfully." });
        router.refresh();
      } else {
        setIdentityMsg({ type: "error", text: res.error });
      }
    });
  };

  // Add & Save Service
  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const updated = [...services, { name: newServiceName.trim() }];
    setServices(updated);
    setNewServiceName("");
    handleSaveServices(updated);
  };

  const handleRemoveService = (index: number) => {
    const updated = services.filter((_, idx) => idx !== index);
    setServices(updated);
    handleSaveServices(updated);
  };

  const handleSaveServices = (itemsToSave: Array<{ name: string }>) => {
    setServicesMsg(null);
    startTransition(async () => {
      const res = await manageServicesAction(initialData.profile.id, itemsToSave);
      if (res.success) {
        setServicesMsg({ type: "success", text: "Services saved." });
        router.refresh();
      } else {
        setServicesMsg({ type: "error", text: res.error });
      }
    });
  };

  // Add & Save Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const updated = [...skills, { name: newSkillName.trim() }];
    setSkills(updated);
    setNewSkillName("");
    handleSaveSkills(updated);
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, idx) => idx !== index);
    setSkills(updated);
    handleSaveSkills(updated);
  };

  const handleSaveSkills = (itemsToSave: Array<{ name: string }>) => {
    setSkillsMsg(null);
    startTransition(async () => {
      const res = await manageSkillsAction(initialData.profile.id, itemsToSave);
      if (res.success) {
        setSkillsMsg({ type: "success", text: "Skills saved." });
        router.refresh();
      } else {
        setSkillsMsg({ type: "error", text: res.error });
      }
    });
  };

  // Add & Save Social Link
  const handleAddSocialLink = () => {
    setSocialMsg(null);
    if (!newSocialUrl.trim()) {
      setSocialMsg({ type: "error", text: "Social URL is required." });
      return;
    }
    if (!newSocialUrl.trim().toLowerCase().startsWith("https://")) {
      setSocialMsg({ type: "error", text: "Social link must start with https://" });
      return;
    }
    if (socialLinks.some((sl) => sl.platform === newPlatform)) {
      setSocialMsg({
        type: "error",
        text: `You have already added a link for ${newPlatform}. Each platform can only be added once.`,
      });
      return;
    }

    const updated = [
      ...socialLinks,
      { platform: newPlatform, url: newSocialUrl.trim() },
    ];
    setSocialLinks(updated);
    setNewSocialUrl("");
    handleSaveSocialLinks(updated);
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, idx) => idx !== index);
    setSocialLinks(updated);
    handleSaveSocialLinks(updated);
  };

  const handleSaveSocialLinks = (
    itemsToSave: Array<{ platform: (typeof SOCIAL_PLATFORMS)[number]; url: string }>
  ) => {
    setSocialMsg(null);
    startTransition(async () => {
      const res = await manageSocialLinksAction(initialData.profile.id, itemsToSave);
      if (res.success) {
        setSocialMsg({ type: "success", text: "Social links saved." });
        router.refresh();
      } else {
        setSocialMsg({ type: "error", text: res.error });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Identity Section */}
      <form
        onSubmit={handleSaveIdentity}
        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Identity & Bio</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Your name, headline, and public profile presentation.
            </p>
          </div>
          {identityMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                identityMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {identityMsg.text}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="displayName" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              minLength={2}
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="headline" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Headline <span className="text-red-400">*</span>
            </label>
            <input
              id="headline"
              type="text"
              minLength={2}
              maxLength={120}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Colorist & Commercial Editor"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Location
            </label>
            <input
              id="location"
              type="text"
              maxLength={80}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London, UK & Remote"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="availability" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Availability Status
            </label>
            <input
              id="availability"
              type="text"
              maxLength={60}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Available for Q4 bookings"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="avatarUrl" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Avatar Image URL
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Bio (Max 1000 characters)
          </label>
          <textarea
            id="bio"
            rows={4}
            maxLength={1000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce your craft, experience, and background..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
          />
          <div className="flex justify-end mt-1 text-[11px] text-zinc-500">
            {bio.length} / 1000
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              "rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPending ? "Saving..." : "Save Identity"}
          </button>
        </div>
      </form>

      {/* 2. Services CRUD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Services</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Creative offerings you provide to clients (e.g. Color Grading, Commercial Editing).
            </p>
          </div>
          {servicesMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                servicesMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {servicesMsg.text}
            </span>
          )}
        </div>

        {/* Existing services list */}
        <div className="space-y-2">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2"
            >
              <span className="text-sm text-zinc-200">{svc.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveService(idx)}
                className="text-xs text-zinc-500 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-xs text-zinc-500 py-2">No services added yet.</p>
          )}
        </div>

        {/* Add new service */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            maxLength={80}
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Add service (e.g. Sound Design, Music Supervision)"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddService();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddService}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
          >
            Add Service
          </button>
        </div>
      </div>

      {/* 3. Skills CRUD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Skills & Software</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tools, applications, and technical specialties.
            </p>
          </div>
          {skillsMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                skillsMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {skillsMsg.text}
            </span>
          )}
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
          {skills.map((sk, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-800 px-3 py-1 text-xs text-zinc-200"
            >
              <span>{sk.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(idx)}
                className="text-zinc-500 hover:text-white transition"
              >
                ×
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-zinc-500">No skills added yet.</p>
          )}
        </div>

        {/* Add skill input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            maxLength={60}
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add skill (e.g. DaVinci Resolve, Avid Media Composer)"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* 4. Social Links CRUD */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Social & External Links</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified links to your channels (Must start with https://).
            </p>
          </div>
          {socialMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                socialMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {socialMsg.text}
            </span>
          )}
        </div>

        {/* Social links list */}
        <div className="space-y-2">
          {socialLinks.map((sl, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 uppercase">
                  {sl.platform}
                </span>
                <span className="text-xs font-mono text-zinc-400 truncate">
                  {sl.url}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSocialLink(idx)}
                className="text-xs text-zinc-500 hover:text-red-400 transition ml-2 shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          {socialLinks.length === 0 && (
            <p className="text-xs text-zinc-500 py-2">No social links added yet.</p>
          )}
        </div>

        {/* Add social link row */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <select
            value={newPlatform}
            onChange={(e) =>
              setNewPlatform(e.target.value as (typeof SOCIAL_PLATFORMS)[number])
            }
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none capitalize"
          >
            {SOCIAL_PLATFORMS.map((plat) => (
              <option key={plat} value={plat} className="capitalize">
                {plat}
              </option>
            ))}
          </select>
          <input
            type="url"
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
            placeholder="https://instagram.com/yourhandle"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSocialLink();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSocialLink}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
