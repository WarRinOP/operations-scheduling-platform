import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, booking_id, status, payload } = body;

    // Simulate webhook ingestion / dispatch to third-party SMS, WhatsApp or Zapier
    const responsePayload = {
      received: true,
      timestamp: new Date().toISOString(),
      dispatched_to: ['Twilio_SMS_Gateway', 'WhatsApp_Business_API', 'Ops_Slack_Channel'],
      event,
      booking_id,
      status,
      details: payload,
    };

    return NextResponse.json({
      success: true,
      message: 'System Event Webhook successfully emitted.',
      data: responsePayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
