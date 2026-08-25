// netlify/functions/submit-lead.js
// This function receives form data from your HTML pages and inserts it into Supabase.

const { createClient } = require('@supabase/supabase-js');

// These environment variables are set in Netlify dashboard (we'll do that later)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use the service role key to bypass RLS for insert (since it's a public form)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email and message are required' })
      };
    }

    // Insert into Supabase leads table
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        project_type: formData.projectType || 'sonstiges',
        urgency: formData.urgency || 'flexibel',
        message: formData.message,
        status: 'new'
      }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database insert failed' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Lead captured successfully',
        lead: data[0]
      })
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};