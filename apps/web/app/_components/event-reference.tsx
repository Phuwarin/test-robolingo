"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const events = [
  {
    name: "message.update",
    publisher: "this.realtime.publishConversation(...)",
    trigger: "รับหรือส่งข้อความสำเร็จ และเมื่อทำเครื่องหมายอ่านแล้ว",
    payload: "lineUserId, conversation และ readReceipt เมื่อมีการอ่าน",
    result: "อัปเดต cache รายการแชท ผู้ใช้ unread และข้อความที่อ่านแล้ว โดยไม่โหลด API ซ้ำ",
  },
  {
    name: "message.sent",
    publisher: "this.realtime.publishMessage(...)",
    trigger: "handleMessage() รับข้อความเข้า หรือ sendMessage() ส่งข้อความออกสำเร็จ",
    payload: "lineUserId และ message: id, lineUserId, direction, body, createdAt, readAt",
    result: "เพิ่มข้อความใน cache ของห้องที่เคยโหลดแล้ว ป้องกันซ้ำด้วย Message ID ห้องที่ยังไม่เคยโหลดจะเรียก API ตอนเปิด",
  },
  {
    name: "workspace.updated",
    publisher: "this.realtime.publishUserUpdated(...)",
    trigger: "handleFollow() เพิ่มเพื่อน หรือ handleUnfollow() บล็อก OA",
    payload: 'lineUserId และ reason: "user"',
    result: "ทำให้ cache ของผู้ใช้ รายการแชท และข้อความหมดอายุ แล้วโหลด query ที่เปิดใช้งานใหม่เบื้องหลัง",
  },
];

export function EventReference() {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="event-reference">
        {expanded ? "ซ่อนรายละเอียด Socket" : "ดูรายละเอียด Socket ทั้ง 3 event"}
      </Button>
      {expanded && (
        <div id="event-reference">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event / ฟังก์ชันที่ส่ง</TableHead>
                <TableHead>ส่งเมื่อ</TableHead>
                <TableHead>ข้อมูลและการทำงานของเว็บ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.name}>
                  <TableCell>
                    <code>{event.name}</code>
                    <p>
                      <code>{event.publisher}</code>
                    </p>
                  </TableCell>
                  <TableCell>{event.trigger}</TableCell>
                  <TableCell>
                    <p>{event.payload}</p>
                    <p>{event.result}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p>
            publishMessage() เรียก publishConversation() ก่อน จึงส่ง message.update แล้ว message.sent ทั้งขารับและขาส่ง แยกฝั่งด้วย direction: received / botSent ทุก event ส่งหลัง transaction สำเร็จ
          </p>
        </div>
      )}
    </>
  );
}
