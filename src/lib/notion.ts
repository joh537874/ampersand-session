// ================================================================
// 📋 이 파일은 무엇인가요?
// 노션(Notion)에 신청/취소 내역을 자동으로 기록하는 파일입니다.
//
// 누군가 세션을 신청하거나 취소할 때마다 노션 데이터베이스에
// 자동으로 기록이 남아요. 노션 기록이 실패해도 신청/취소 자체는
// 정상적으로 처리됩니다.
// ================================================================

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID!;

export async function logToNotion({
  name,
  sessionTitle,
  action,
}: {
  name: string;
  sessionTitle: string;
  action: '신청' | '취소';
}) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      이름: {
        title: [{ text: { content: name } }],
      },
      세션명: {
        rich_text: [{ text: { content: sessionTitle } }],
      },
      구분: {
        select: { name: action },
      },
      처리시각: {
        date: { start: new Date().toISOString() },
      },
    },
  });
}
