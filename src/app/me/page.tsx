'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext, Component } from "react"
import { TodoProps, SaveTodosReturnProps } from "@/types"
import Header from "@/components/header";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { TodoContext } from "@/provider/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { ActivityCalendar } from 'react-activity-calendar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link as LinkIcon, Mail, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image";

export default function Me() {

  const { user, isLoading: userLoading } = useAuth0();
  useEffect(() => {
    if (!userLoading && user === undefined) {
      // redirect('/t')
    }
  }, [user, userLoading])

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };
  const [popup, setPopup] = useState(false);
  const data = [
    {
      date: '2024-01-01',
      count: 0,
      level: 0,
    },
    {
      date: '2024-06-22',
      count: 2,
      level: 1,
    },
    {
      date: '2024-06-23',
      count: 2,
      level: 2,
    },
    {
      date: '2024-06-24',
      count: 2,
      level: 3,
    },
    {
      date: '2024-06-25',
      count: 16,
      level: 4,
    },
    {
      date: '2024-11-29',
      count: 11,
      level: 3,
    },
  ];
  const mainPCHeight = `h-[calc(100vh-70px)]` // 100vh - headerHeight
  return (
    <>
      <Header user={user} userLoading={userLoading} />
      <article className={`${mainPCHeight} px-6`} onMouseMove={handleMouseMove}>
        <div className="flex w-full pt-12 pb-6">
          <Avatar className="h-16 w-16 ring-1 ring-muted-foreground">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback><div className="text-center">No image</div></AvatarFallback>
          </Avatar>
          <div className="px-8">
            <h1 className="text-2xl">{user?.name ?? "Anonymous"}</h1>
            <p className="text-sm text-muted-foreground">{user?.email ?? "my id"}</p>
          </div>
        </div>
        <p className="rounded-md py-4 text-sm">
          ここに短いプロフィールが記載される
        </p>
        <div className="py-8">
          <ul className="text-sm flex flex-col gap-2">
            <ExLink href="http://example.com" ><Mail className="w-4 h-4" /></ExLink>
            <ExLink href="http://example.com" ><X className="w-4 h-4" /></ExLink>
            <ExLink href="http://example.com" ><LinkIcon className="w-4 h-4" /></ExLink>
          </ul>
        </div>
        <div className="flex gap-2 pb-8">
          <Card className="text-sm w-[50%]">
            <CardHeader><CardTitle className="text-sm">進行中</CardTitle></CardHeader>
            <CardContent className="text-5xl">10</CardContent>
          </Card>
          <Card className="text-sm w-[50%]">
            <CardHeader><CardTitle className="text-sm">完了</CardTitle></CardHeader>
            <CardContent className="text-5xl">10</CardContent>
          </Card>
        </div>
        <hr />
        <div className="flex justify-between text-sm items-center py-4">
          <span>アクティビティ</span>
          <Select>
            <SelectTrigger className="w-[100px] text-xs" >
              <SelectValue placeholder="2024年" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">2023年</SelectItem>
              <SelectItem value="dark">2022年</SelectItem>
              <SelectItem value="system">2021年</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={`flex justify-center w-full pb-8`}>
          <Card className="flex justify-center w-full p-4 max-w-[800px]">
            <ActivityCalendar
              eventHandlers={{
                onMouseOver: (event) => (activity) => { },
              }}
              data={data}
              showWeekdayLabels
              maxLevel={9}
              fontSize={12}
              blockSize={10}
              theme={{
                "light": [
                  "#fafafa",
                  "#bbf7d0",
                  "#86efac",
                  "#4ade80",
                  "#22c55e",
                  "#16a34a",
                  "#15803d",
                  "#166534",
                  "#14532d",
                  "#124e28",
                ],
                "dark": [
                  "#fff",
                  "#bbf7d0",
                  "#86efac",
                  "#4ade80",
                  "#22c55e",
                  "#16a34a",
                  "#15803d",
                  "#166534",
                  "#14532d",
                  "#124e28",
                ]
              }}
              labels={{
                months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                weekdays: ["日", "月", "火", "水", "木", "金", "土"],
                totalCount: "✅ {{count}}件（{{year}}年）",
                legend: {
                  less: "🌱",
                  more: "🌳",
                }
              }}
            />
          </Card>
        </div>
        <div>
          <Card className="text-sm">
            <CardHeader><CardTitle className="text-sm">プロジェクト</CardTitle></CardHeader>
            <CardContent>aaaa</CardContent>
          </Card>
        </div>
        {/* マウスオーバーで表示されるポップアップ*/}
        {popup &&
          <div
            className="absolute z-50 w-48 h-24 bg-white shadow-lg rounded-md"
            style={{ top: mousePosition.y, left: mousePosition.x }}
          >
            <div className="p-2">
              <p>2024-06-23</p>
              <p>2</p>
            </div>
          </div>
        }
        <footer className="flex sm:flex-row flex-col-reverse sm:justify-between items-center px-12 gap-8 py-12">
          <div className="flex items-center gap-1">
            <Image
              src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
              alt="Shiba Todo Logo"
              className="w-[20px]"
              width={500}
              height={500}
            />
            <span className="text-sm">Copyright©2024 Shiba Tools</span>
          </div>
          <div className="flex flex-wrap justify-start sm:justify-end gap-3">
            <ExLink href="/terms" label="利用規約"></ExLink>
            <ExLink href="/privacy" label="プライバシーポリシー" />
            <ExLink target="_blank" rel="noopener noreferrer" href={process.env.NEXT_PUBLIC_CONTACT_URL || ""} label="お問い合わせ" />
          </div>
        </footer>
      </article >
    </>
  );
}

const ExLink = ({ href, label, rel, target, children, ...props }: { href: string, label?: string, rel?: string, target?: string, children?: React.ReactNode }) => {
  return (
    <span className="flex gap-2 text-sm items-center">
      {children}
      <Link href={href} rel={rel} target={target} className={`hover:text-primary hover:underline hover:cursor-pointer transition-all`} {...props} >
        {label ?? href}
      </Link >
    </span>
  )
}
