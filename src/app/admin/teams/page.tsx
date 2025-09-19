"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeft, Edit2, Trash2, Save } from 'lucide-react'

interface Team { id: string; code: string; displayName: string }

export default function AdminTeamsPage() {
	const router = useRouter()
	const [teams, setTeams] = useState<Team[]>([])
	const [editing, setEditing] = useState<Record<string, { code: string; displayName: string }>>({})

	const load = async () => {
		const token = localStorage.getItem('adminToken')
		if (!token) { router.push('/admin'); return }
		const res = await fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } })
		if (res.ok) {
			const data = await res.json()
			setTeams(data.teams.map((t: any) => ({ id: t.id, code: t.code, displayName: t.displayName })))
		}
	}
	useEffect(() => { load() }, [])

	const startEdit = (team: Team) => {
		setEditing({ ...editing, [team.id]: { code: team.code, displayName: team.displayName } })
	}

	const save = async (id: string) => {
		try {
			const token = localStorage.getItem('adminToken')
			const body = { id, ...editing[id] }
			const res = await fetch('/api/admin/teams', { 
				method: 'PATCH', 
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
				body: JSON.stringify(body) 
			})
			if (!res.ok) {
				const error = await res.json()
				alert(`Error updating team: ${error.error}`)
				return
			}
			setEditing((e) => { const n = { ...e }; delete n[id]; return n })
			load()
		} catch (err) {
			alert('Failed to update team')
		}
	}

	const remove = async (id: string) => {
		if (!confirm('Delete team? This will remove all their data permanently.')) return
		try {
			const token = localStorage.getItem('adminToken')
			const res = await fetch('/api/admin/teams', { 
				method: 'DELETE', 
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
				body: JSON.stringify({ id }) 
			})
			if (!res.ok) {
				const error = await res.json()
				alert(`Error deleting team: ${error.error}`)
				return
			}
			load()
		} catch (err) {
			alert('Failed to delete team')
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
					<Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900"><ArrowLeft className="h-6 w-6" /></Link>
					<h1 className="text-xl font-bold text-gray-800 flex items-center"><Users className="h-6 w-6 mr-2"/>Teams</h1>
				</div>
			</header>
			<div className="max-w-5xl mx-auto p-6">
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left text-sm text-gray-600">Code</th>
								<th className="px-4 py-2 text-left text-sm text-gray-600">Display Name</th>
								<th className="px-4 py-2 text-right text-sm text-gray-600">Actions</th>
							</tr>
						</thead>
						<tbody>
							{teams.map((t) => (
								<tr key={t.id} className="border-t">
									<td className="px-4 py-2">
										{editing[t.id] ? (
											<input className="border rounded px-2 py-1" value={editing[t.id].code} onChange={(e) => setEditing({ ...editing, [t.id]: { ...editing[t.id], code: e.target.value.toUpperCase() } })} />
										) : t.code}
									</td>
									<td className="px-4 py-2">
										{editing[t.id] ? (
											<input className="border rounded px-2 py-1 w-full" value={editing[t.id].displayName} onChange={(e) => setEditing({ ...editing, [t.id]: { ...editing[t.id], displayName: e.target.value } })} />
										) : t.displayName}
									</td>
									<td className="px-4 py-2 text-right space-x-2">
										{editing[t.id] ? (
											<button className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded" onClick={() => save(t.id)}><Save className="h-4 w-4 mr-1"/>Save</button>
										) : (
											<button className="p-2 text-gray-600 hover:text-blue-600" onClick={() => startEdit(t)}><Edit2 className="h-4 w-4"/></button>
										)}
										<button className="p-2 text-gray-600 hover:text-red-600" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4"/></button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
