import { NextResponse } from 'next/server';

/**
 * API Route to fetch the user profile from the external ISMS.ASIA API.
 * It acts as a secure proxy to avoid exposing the API token to the client-side.
 */
export async function GET(request) {
  // 1. Get the API Token from environment variables for security
  const apiToken = process.env.SMS_API_TOKEN;

  // 2. Check if the token is configured on the server
  if (!apiToken) {
    console.error('Error: SMS_API_TOKEN is not set in environment variables.');
    // Return a server error response if the token is missing
    return NextResponse.json({ 
      success: false, 
      message: 'Server is not configured correctly. Missing API Token.' 
    }, { status: 500 });
  }

  // 3. Make the request to the external API
  try {
    const apiResponse = await fetch('https://portal.isms.asia/sms-api/profile/get', {
      method: 'GET',
      headers: {
        // Use the token from environment variables in the Authorization header
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      // Use 'no-store' to ensure we always get the latest profile data
      cache: 'no-store',
    });

    // 4. Handle non-successful responses from the external API
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`External API Error: ${apiResponse.status} ${apiResponse.statusText}`, errorText);
      return NextResponse.json({ 
        success: false, 
        message: `Failed to fetch profile from external API. Status: ${apiResponse.status}` 
      }, { status: apiResponse.status });
    }

    // 5. Parse the JSON data from the successful response
    const data = await apiResponse.json();

    // 6. Validate the response structure and extract the entire account profile
    if (data.status === 'success' && data.data?.account) {
      const userProfile = data.data.account;
      // Return a successful response to our frontend with the full profile
      return NextResponse.json({ success: true, profile: userProfile });
    } else {
      // Handle cases where the response format is not what we expect
      console.error('Unexpected response structure from external API:', data);
      return NextResponse.json({ 
        success: false, 
        message: 'Received an unexpected response format from the API.' 
      }, { status: 500 });
    }

  } catch (error) {
    // 7. Handle network errors or other issues with the fetch call
    console.error('Internal Server Error while fetching profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An internal server error occurred.' 
    }, { status: 500 });
  }
}
