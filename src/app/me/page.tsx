'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext, Component } from "react"
import { TodoProps, SaveTodosReturnProps } from "@/types"
import Header from "@/components/header";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch } from "@/lib/fetch";
import { cn, debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { TodoContext } from "@/provider/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { ActivityCalendar } from 'react-activity-calendar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Box, BoxIcon, Calendar, Check, Circle, CircleCheck, Clock, Footprints, History, Hourglass, Link as LinkIcon, Mail, PlusCircle, Rocket, Tag, User, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Chart } from "react-google-charts";
import { activity, summary, timeline } from "@/app/me/sample_data"

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
          ここに短いプロフィールが記載される。自分の伝えたいこととかがここに記載される
        </p>
        <div className="py-8">
          <ul className="text-sm flex flex-col gap-2">
            <ExLink href="http://example.com" ><Mail className="w-4 h-4" /></ExLink>
            <ExLink href="http://example.com" ><X className="w-4 h-4" /></ExLink>
            <ExLink href="http://example.com" ><LinkIcon className="w-4 h-4" /></ExLink>
          </ul>
        </div>
        <div className="space-y-8 pb-8">
          <div className="flex gap-2">
            <Card className="text-sm w-[50%]">
              <CardHeader><CardTitle className="flex items-center gap-1 text-lg"><Hourglass className="h-4" />進行中</CardTitle></CardHeader>
              <CardContent className="text-5xl text-right">{summary.in_progress}</CardContent>
            </Card>
            <Card className="text-sm w-[50%]">
              <CardHeader><CardTitle className="flex items-center gap-1 text-lg"><CircleCheck className="h-4" />完了</CardTitle></CardHeader>
              <CardContent className="text-5xl text-right">{summary.completed}</CardContent>
            </Card>
          </div>
          <div>
            <span className="text-lg flex items-center gap-1 pb-4"><Footprints className="h-4" />My Projects</span>
            <div className="space-y-8">

              {summary.projects.map((project, index) => (
                <Card key={index} className="text-sm w-[100%]">
                  <CardContent>
                    <div className="flex items-start gap-1  pt-6 justify-between">
                      <div>
                        <div className="flex items-start gap-1 text-ex-project pr-1">
                          <div className="w-[20px]"><Box className="h-[18px]" /></div><span>{project.name}</span>
                        </div>
                        {project.tags.length > 0 &&
                          <div className="flex flex-wrap gap-2 px-4 py-6">
                            {project.tags.map((tag, index) => (
                              <ExLabelBadge key={index}>{tag}</ExLabelBadge>
                            ))}
                          </div>
                        }
                      </div>
                      <div className=" text-xl">
                        <span className="flex items-center justify-between gap-1"><Hourglass className="h-4" /><span className="text-right">{project.in_progress}</span></span>
                        <span className="flex items-center justify-between gap-1"><CircleCheck className="h-4" /><span className="text-right">{project.completed}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 px-4 ">
                      <div className="flex py-2">
                        <span className="bg-primary/30 w-[10px] h-[10px] border m-[0.2px]"></span>
                        <span className="bg-primary/30 w-[10px] h-[10px] border m-[0.2px]"></span>
                      </div>
                      <div className="flex justify-between">
                        <span>{project.start}</span><span>〜</span><span>{project.end}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
              }
            </div>
          </div>
        </div>

        {/*  まだ早い
        <div className="py-8">
          <span className="text-lg flex items-center gap-1 pb-4"><Footprints className="h-5" />My Projects</span>
          <div className="space-y-4">
            <Card className="text-sm w-[100%]">
              <CardHeader><CardTitle className="flex items-center gap-1 text-md text-ex-project"><Box className="h-4" />その他</CardTitle></CardHeader>
              <CardContent>
                <p className="flex justify-between">
                  <span>2024/1/3 〜 2024/3/4</span>
                  <span className="flex gap-2">
                    <span className="flex gap-1 items-center"><Hourglass className="h-4" />20</span>
                    <span className="flex gap-1 items-center"><CircleCheck className="h-4" />30</span>
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card className="text-sm w-[100%]">
              <CardHeader><CardTitle className="flex items-center gap-1 text-md text-ex-project"><Box className="h-4" />その他</CardTitle></CardHeader>
              <CardContent>
                <p className="flex justify-between">
                  <span>2024/1/3 〜 2024/3/4</span>
                  <span className="flex gap-2">
                    <span className="flex gap-1 items-center"><Hourglass className="h-4" />20</span>
                    <span className="flex gap-1 items-center"><CircleCheck className="h-4" />30</span>
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div> */}
        < div className="space-y-8" >
          <div className="flex justify-between text-sm items-center pt-4">
            <span className="text-lg flex items-center gap-1"><Activity className="h-5" />アクティビティ</span>
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
          <div className={`flex justify-center w-full`}>
            <Card className="flex justify-center w-full p-4 max-w-[800px]">
              <ActivityCalendar
                eventHandlers={{
                  onMouseOver: (event) => (activity) => { },
                }}
                data={activity}
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
          <div className="flex flex-col gap-4">
            <section>
              <h1 className="text-lg flex items-center gap-1 sticky top-0 h-[100px] bg-background"><History className="h-5" />タイムライン</h1>
              <div className="pl-2">

                <h2 className="sticky top-[100px] h-[40px] bg-background ">2024年12月</h2>
                <div className="border-l border-l-primary m-4 p-4 mt-0">

                  {timeline.map((item, index) => (
                    <div key={index} className={`p-4 mb-4 ${item.is_complete ? 'border bg-card shadow-lg rounded-lg' : ''}`}>
                      <div className="text-xs text-secondary-foreground flex justify-between py-1">
                        <span className={`flex items-center ${item.is_complete ? 'text-primary' : ''}`}>
                          {item.is_complete ? <Check className="h-4" /> : <Rocket className="h-4" />} {item.is_complete ? '完了' : '作成'}
                        </span>
                        <span className="flex gap-2">
                          <span className="flex items-center"><Calendar className="h-3" />{item.creationDate}</span>
                          <span className="flex items-center"><Clock className="h-3" /> {item.creationDate}</span>
                        </span>
                      </div>
                      <h3 className="flex items-center gap-2 align-middle py-3 pl-2">
                        {item.text}
                        <span className="text-xs font-semibold flex text-ex-project items-center"><Box className="h-4 text-ex-project" /><Tag className="h-3 text-ex-label" /></span>
                      </h3>
                    </div>
                  ))}

                </div>
                <div className="flex w-full justify-center py-12"><Button size={"lg"}>Read more</Button></div>
              </div>
            </section>
            {/* <Card className="text-sm">
            <CardHeader>
              <CardTitle className="text-base text-ex-project flex gap-1 items-center"><Box className="h-5"/>プライベート</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center h-full gap-2">
                <ExBadge >なし</ExBadge>
                <span>10件</span>
              </div>
              <div className="flex items-center h-full gap-2">
                <ExBadge >進捗中</ExBadge>
                <span>10件</span>
              </div>
            </CardContent>
          </Card> */}
          </div>
        </div>
        {/* マウスオーバーで表示されるポップアップ*/}
        {popup &&
          <div
            className="absolute z-50 w-48 h-24 bg-white shadow-lg rounded-md"
            style={{ top: mousePosition.y, left: mousePosition.x }}>
            <div className="p-2">
              <p>2024-06-23</p>
              <p>2</p>
            </div>
          </div>
        }
        <footer className="flex sm:flex-row flex-col-reverse sm:justify-between items-center  gap-8 py-12">
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

const ExBadge = ({ children, className, ...props }: { className?: string, children: React.ReactNode }) => {
  return (
    <Badge variant={"outline"}  {...props}>
      <span className={cn("flex items-center gap-1", className)}>{children}</span>
    </Badge>
  )
}

const ExLabelBadge = ({ children, className, ...props }: { className?: string, children: React.ReactNode }) => {
  return <ExBadge className={cn("text-ex-label text-xs ", className)}><Tag className="h-3" /> {children}</ExBadge>
}