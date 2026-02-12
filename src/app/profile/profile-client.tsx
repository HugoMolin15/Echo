'use client'

import React, { useState, useRef } from 'react'
import { StarTrailCanvas } from '@/components/ui/star-trail-background'
import { ArrowLeft, Loader2, Camera, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { updateProfile, uploadAvatar } from './actions'

export default function ProfilePage({ user }: { user: User | null }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white/60">Please log in to view your profile.</p>
            </div>
        )
    }

    async function handleAvatarClick() {
        fileInputRef.current?.click()
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadAvatar(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.publicUrl) {
            setAvatarUrl(result.publicUrl)
            setMessage("Avatar uploaded! Don't forget to save changes.")
        }
        setIsUploading(false)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        formData.append('avatar_url', avatarUrl)

        const result = await updateProfile(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setMessage("Profile updated successfully!")
        }
        setIsLoading(false)
    }

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex items-center justify-center">
            <StarTrailCanvas enableTrail={false} />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="mb-6 flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all text-sm font-medium backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-none shadow-none">

                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group mb-4"
                            onClick={handleAvatarClick}
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-white/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <h2 className="text-2xl font-bold">Your Profile</h2>
                        <p className="text-white/40 text-sm">{user.email}</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs p-3 rounded-xl mb-6 text-center">
                            {message}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Full Name</label>
                            <input
                                name="full_name"
                                type="text"
                                defaultValue={user.user_metadata?.full_name || ''}
                                placeholder="Edit your name"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        <button
                            disabled={isLoading || isUploading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-full transition-all mt-4 cursor-pointer border border-transparent hover:bg-white/5 hover:text-white hover:border-purple-500/50 hover:backdrop-blur-sm flex items-center justify-center gap-2"
                        >
                            {(isLoading || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
