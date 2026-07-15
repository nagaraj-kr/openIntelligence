import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.role === 'ADMIN';
  } catch { return false; }
}

// PUT /api/admin/meetings/[id] — update basic info OR add outcome
export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const {
    title, description, date, venue, registration_link, cover_image,
    // outcome fields
    outcome_title, outcome_summary, attendees_count, photos, tags,
    status,
  } = body;

  // Build update payload — only include defined fields
  const data = {};

  if (title !== undefined)             data.title             = title;
  if (description !== undefined)       data.description       = description;
  if (date !== undefined)              data.date              = new Date(date);
  if (venue !== undefined)             data.venue             = venue;
  if (registration_link !== undefined) data.registration_link = registration_link || '';
  if (cover_image !== undefined)       data.cover_image       = cover_image;
  if (status !== undefined)            data.status            = status;
  if (outcome_title !== undefined)     data.outcome_title     = outcome_title;
  if (outcome_summary !== undefined)   data.outcome_summary   = outcome_summary;
  if (attendees_count !== undefined)   data.attendees_count   = attendees_count ? Number(attendees_count) : null;
  if (photos !== undefined)            data.photos            = photos;
  if (tags !== undefined)              data.tags              = tags;

  // If outcome fields are being saved and status not explicit, mark COMPLETED
  if ((outcome_summary || outcome_title) && status === undefined) {
    data.status = 'COMPLETED';
  }

  const meeting = await prisma.meeting.update({ where: { id }, data });
  return NextResponse.json({ success: true, meeting });
}

// DELETE /api/admin/meetings/[id]
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
