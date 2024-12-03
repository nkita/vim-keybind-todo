'use client'

import { useState, useEffect, Fragment } from "react"
import Header from "@/components/header";
import { useAuth0 } from "@auth0/auth0-react";
import { cn } from "@/lib/utils";
import { ActivityCalendar } from 'react-activity-calendar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Box, Calendar, Check, CircleCheck, Clock, Footprints, History, Hourglass, Link as LinkIcon, Mail, PlusCircle, Rocket, Tag, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { activityDate, activityYear, summary, timeline_page1, timeline_page2, userInfo } from "@/app/me/sample_data"

export default function Me() {

  const { user, isLoading: userLoading } = useAuth0();
  useEffect(() => {
    if (!userLoading && user === undefined) {
      // redirect('/t')
    }
  }, [user, userLoading])


  const [timeline, setTimeline] = useState(timeline_page1)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  interface MousePosition {
    x: number;
    y: number;
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };
  const [popup, setPopup] = useState(false);
  const mainPCHeight = `h-[calc(100vh-70px)]` // 100vh - headerHeight
  const handleClickReadmore = () => {
    setTimeline(prev => [...prev, ...timeline_page2])
  }

  return (
    <>
      <Header user={user} userLoading={userLoading} />
      <div className={`w-full px-4 sm:px-6 pt-12 gap-4 max-w-[1024px] justify-center m-auto `} onMouseMove={handleMouseMove}>
        <article className="md:flex w-full gap-6 px-4">
          <div className="flex flex-col md:w-[30%] pb-6">
            <div className="m-0 sticky top-0 pt-4">
              <div className="flex items-center md:flex-col sm:gap-2 pb-6 w-full">
                <Avatar className="h-24 md:h-40 sm:h-36 w-24 md:w-40 sm:w-36 bg-card">
                  <AvatarImage src={userInfo?.image} alt={userInfo?.nickname} />
                  <AvatarFallback><div className="text-center">No image</div></AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center w-full px-4">
                  <div className="sm:px-0 px-6 w-full bottom-0 ">
                    <h1 className="text-2xl">{userInfo?.nickname ?? "Anonymous"}</h1>
                    <p className="text-sm text-muted-foreground">{userInfo?.id ?? "my id"}</p>
                  </div>
                </div>
              </div>
              <p className="rounded-md py-2 text-sm">
                {userInfo?.profile ?? "No profile"}
              </p>
              <ul className="text-sm space-y-2">
                {userInfo?.links.map((link, index) => (
                  <ExLink href={link} key={index} ><LinkIcon className="w-4 h-4" /></ExLink>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full md:w-[70%]">
            <ExH className="pt-0">My Tasks</ExH>
            <div className="space-y-8">
              <div className="flex gap-2">
                <Card className="text-sm w-full">
                  <CardHeader><CardTitle className="flex items-center gap-1 text-lg"><Hourglass className="h-4" />進行中</CardTitle></CardHeader>
                  <CardContent className="text-5xl text-right">{summary.in_progress}</CardContent>
                </Card>
                <Card className="text-sm w-full">
                  <CardHeader><CardTitle className="flex items-center gap-1 text-lg"><CircleCheck className="h-4" />完了</CardTitle></CardHeader>
                  <CardContent className="text-5xl text-right">{summary.completed}</CardContent>
                </Card>
              </div>
              <div>
                <ExH><Footprints className="h-4" />My Projects</ExH>
                {/* <div className="flex flex-col flex-nowrap sm:flex-row sm:flex-wrap gap-3"> */}
                {summary.projects.length <= 0 && <div className="pl-4">No projects.</div>}
                <div className="space-y-3">
                  {summary.projects.map((project, index) => (
                    <Card key={index} className="text-sm ">
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

            <div className="w-full" >
              <ExH><Activity className="h-5" />アクティビティ</ExH>
              {activityYear.length > 0 ? (
                <>
                  <div className="flex justify-end pb-2">
                    <Select>
                      <SelectTrigger className="w-[100px] text-xs text-" >
                        <SelectValue placeholder="2024年" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityYear.map((year) => (
                          <SelectItem value={year} key={year}>{year}年</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=" bg-card border rounded-md p-4 shadow-sm">
                    <ActivityCalendar
                      eventHandlers={{
                        onMouseOver: (event) => (activity) => { },
                      }}
                      data={activityDate}
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
                  </div>
                </>
              ) : (
                <div className="pl-4">No activity.</div>
              )}
            </div>

            <div className="space-y-8 pt-8" >
              <div>
                <section className="relative">
                  <ExH className="pt-0 pb-4 sticky top-0 h-[60px] bg-background z-10"><History className="h-5" />タイムライン</ExH>
                  {!timeline || timeline.length <= 0 && <div className="pl-4">No timeline.</div>}
                  {timeline.length > 0 && <div className="absolute h-full w-[1px] bg-primary/30 left-4  top-0 overflow-hidden z-0"> </div>}
                  <div className="pl-2">
                    {timeline.map((item, index) => {
                      const prevUpdateDate = timeline[index - 1]?.updateDate.split("-")
                      const prevYMD = prevUpdateDate && [prevUpdateDate[0], prevUpdateDate[1], prevUpdateDate[2].split("T")[0]].join("-")
                      const updateDate = item.updateDate.split("-")
                      const updateYMD = [updateDate[0], updateDate[1], updateDate[2].split("T")[0]].join("-")
                      const isLabel = prevYMD !== updateYMD
                      return (
                        <Fragment key={index}>
                          {updateDate && isLabel &&
                            <div className={`sticky top-[60px] bg-transparent flex items-center `}>
                              <h2 className="border border-b border-primary/30 rounded-md bg-background pl-2 pr-8 py-1 text-sm flex items-center gap-2"><Calendar className="h-4" />{updateYMD}</h2>
                            </div>
                          }
                          <div className={`py-3 pl-6 my-4  ${item.is_complete ? 'ml-8 border border-primary bg-card rounded-lg' : 'ml-8 border bg-background rounded-lg'}`}>
                            <div className="text-xs text-secondary-foreground flex gap-4 items-center">
                              <span className="flex gap-2">
                                <span className="flex items-center"><Clock className="h-4 text-muted-foreground" /> {updateDate[2].split("T")[1].split(".")[0]}</span>
                              </span>
                              <span className={`flex items-center ${item.is_complete ? 'text-primary' : 'text-muted-foreground'} text-xs`}>
                                {item.is_complete ? <Check className="h-4" /> : <Rocket className="h-4" />} {item.is_complete ? '完了' : 'アクション'}
                              </span>
                            </div>
                            <h3 className="flex items-center gap-2 align-middle pl-2 py-1">
                              {item.text}
                              <span className="text-xs font-semibold flex text-ex-project items-center"><Box className="h-4 text-ex-project" /><Tag className="h-3 text-ex-label" /></span>
                            </h3>
                          </div>
                        </Fragment>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>

            <div className="flex w-full justify-center py-12"><Button size={"lg"} onClick={handleClickReadmore}>Read more</Button></div>
          </div>
          {/* マウスオーバーで表示されるポップアップ*/}
          {/* {popup &&
          <div
            className="absolute z-50 w-48 h-24 bg-white shadow-lg rounded-md"
            style={{ top: mousePosition.y, left: mousePosition.x }}>
            <div className="p-2">
              <p>2024-06-23</p>
              <p>2</p>
            </div>
          </div>
        } */}
        </article >
      </div>
      <footer className="flex sm:flex-row flex-col-reverse sm:justify-between items-center sm:px-16  gap-8 py-12">
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
    </>
  );
}

const ExLink = ({ href, label, rel, target, children, ...props }: { href: string, label?: string, rel?: string, target?: string, children?: React.ReactNode }) => {
  return (
    <span className="flex gap-1 text-sm items-center">
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

const ExH = ({ children, className, ...props }: { className?: string, children: React.ReactNode }) => {
  return <h2 className={cn("text-lg flex items-center gap-1 pt-8 pb-4", className)}>{children}</h2>
}