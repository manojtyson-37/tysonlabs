import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('--- Starting Inbox DB Migration & Cleanup ---');

  // 1. Check messages in bogus self conversation
  const bogusMsgs = await pool.query(
    'SELECT id, recipient_id, text, created_at FROM inbox_messages WHERE conversation_id = $1',
    ['ig_dm_17841470062375430_17841470062375430']
  );
  console.log(`Found ${bogusMsgs.rows.length} messages in bogus self conversation.`);

  for (const msg of bogusMsgs.rows) {
    if (msg.recipient_id && msg.recipient_id !== '17841470062375430') {
      const targetConvId = `ig_dm_17841470062375430_${msg.recipient_id}`;
      console.log(`Reassigning msg ${msg.id.slice(0, 24)}... -> conv ${targetConvId}`);

      // Ensure target conv exists
      await pool.query(
        `INSERT INTO inbox_conversations (
          id, tenant_id, platform, channel_type, account_id, account_name,
          participant_id, participant_name, last_message, last_message_at,
          unread_count, status, updated_at
        ) VALUES ($1, $2, 'instagram', 'dm', $3, $4, $5, $6, $7, $8, 0, 'replied', now())
        ON CONFLICT (id) DO UPDATE SET
          last_message = EXCLUDED.last_message,
          last_message_at = EXCLUDED.last_message_at,
          updated_at = now()`,
        [
          targetConvId,
          'travel_kathegalu',
          '17841470062375430',
          'Travel Kathegalu',
          msg.recipient_id,
          `Instagram User (${msg.recipient_id.slice(-4)})`,
          msg.text,
          msg.created_at,
        ]
      );

      // Move message and mark as outbound
      await pool.query(
        `UPDATE inbox_messages
         SET conversation_id = $1, direction = 'outbound', sender_name = 'Travel Kathegalu'
         WHERE id = $2`,
        [targetConvId, msg.id]
      );
    }
  }

  // Delete bogus self-conversation
  const delRes = await pool.query(
    `DELETE FROM inbox_conversations WHERE id = $1`,
    ['ig_dm_17841470062375430_17841470062375430']
  );
  console.log(`Deleted bogus self-conversation (${delRes.rowCount} row removed).`);

  // Delete any lingering self conversations where participant_id = account_id
  const selfDel = await pool.query(
    `DELETE FROM inbox_conversations WHERE participant_id = account_id`
  );
  console.log(`Deleted ${selfDel.rowCount} self-referencing conversations.`);

  // Fix ig_comment_18010660076782817 participant_name
  await pool.query(`
    UPDATE inbox_conversations
    SET participant_name = '@yourssvlogs',
        last_message = 'You: Sent you the full Bengaluru PDF guide in DMs! Check your requests ✈️❤️',
        unread_count = 0,
        status = 'replied'
    WHERE id = 'ig_comment_18010660076782817'
  `);
  console.log('Restored ig_comment_18010660076782817 participant_name to @yourssvlogs');

  // Fix outbound direction for comments sent by Travel Kathegalu
  await pool.query(`
    UPDATE inbox_messages
    SET direction = 'outbound', sender_name = 'Travel Kathegalu'
    WHERE sender_id = '17841470062375430' OR sender_name = '@travel_kathegalu'
  `);
  console.log('Updated outbound messages from Travel Kathegalu');

  // Expand trigger keywords on reel automations
  await pool.query(`
    UPDATE inbox_reel_automations
    SET trigger_keywords = 'GUIDE,PDF,DAY15,DAY 15,ITINERARY,FOOD,SEND,MAP,LINK,PLEASE,HELLO,HI,HEY,INFO'
    WHERE id = 'auto_reel_lead_magnet_blr'
  `);
  console.log('Expanded trigger keywords on auto_reel_lead_magnet_blr');

  // Verify remaining conversations
  const remaining = await pool.query(
    `SELECT id, participant_id, participant_name, last_message, unread_count, status
     FROM inbox_conversations
     ORDER BY last_message_at DESC
     LIMIT 15`
  );
  console.log('\n--- Cleaned Conversations List ---');
  for (const c of remaining.rows) {
    console.log(`• [${c.id}] ${c.participant_name} (${c.participant_id}): "${c.last_message?.slice(0, 50)}" [${c.status}, unread: ${c.unread_count}]`);
  }

  await pool.end();
}

run().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});
