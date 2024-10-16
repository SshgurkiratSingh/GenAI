import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new NextResponse('Missing email or password', { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (!user || !user.hashedPassword) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isCorrectPassword) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  return NextResponse.json(user);
}