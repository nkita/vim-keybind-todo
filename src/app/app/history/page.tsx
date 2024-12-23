'use client'

import { useState, useEffect, Fragment, useContext, use } from "react"
import { useAuth0 } from "@auth0/auth0-react";
import { cn } from "@/lib/utils";
import { ActivityCalendar } from 'react-activity-calendar';
import { Activity, Box, Calendar, Check, CircleCheck, Clock, Footprints, History, Hourglass, Link as LinkIcon, Mail, Pencil, PlusCircle, Rocket, Tag, User, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { getFetch, useFetch } from "@/lib/fetch";
import { TodoContext } from "@/provider/todo";
import { ProjectProps, SummaryProps, UserInfoProp } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import AppPageTemplate from "@/components/app-page-template";
import { useSidebar } from "@/components/ui/sidebar";

export default function MyHisotry() {

  const { user, isLoading: userLoading } = useAuth0();
  const [timeline, setTimeline] = useState<any[]>([])
  const [timelinePage, setTimelinePage] = useState(0)
  const [timelineLoading, setTimelineLoading] = useState(true);
  const { open } = useSidebar()

  const config = useContext(TodoContext)
  useEffect(() => {
    if (!userLoading && user === undefined) {
      // redirect('/t')
    }
  }, [user, userLoading])

  const { data: summary, isLoading: summaryLoading } = useFetch<SummaryProps>(`${process.env.NEXT_PUBLIC_API}/api/summary`, config.token ?? "")
  const { data: activity, isLoading: activityLoading } = useFetch<any[]>(`${process.env.NEXT_PUBLIC_API}/api/summary/${"2024"}`, config.token ?? "")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result: any[] = await getFetch(`${process.env.NEXT_PUBLIC_API}/api/timeline?page=${timelinePage}&limit=10`, config.token ?? "");
        setTimeline(result);
      } finally {
        setTimelineLoading(false);
      }
    };

    if (timelinePage === 0 && config.token) {
      fetchData();
    }
  }, [timelinePage, config.token])

  // const [timeline, setTimeline] = useState(timeline_page1)
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
  const handleClickReadmore = async () => {
    setTimelineLoading(true);
    try {
      const nextPage = timelinePage + 1;
      setTimelinePage(nextPage);
      const result: any[] = await getFetch(`${process.env.NEXT_PUBLIC_API}/api/timeline?page=${nextPage}&limit=10`, config.token ?? "");
      setTimeline(prev => [...prev, ...result]);
    } finally {
      setTimelineLoading(false);
    }
  }
  return (
    <AppPageTemplate>
      <main className={`${open ? "md:w-[calc(100vw-17rem)]" : "md:w-[calc(100vw-4rem)]"} p-8`}>
        <div className="m-auto max-w-[800px]">
          <ExH className="pt-0">Summary</ExH>
          <div className="space-y-8">
            <div className="flex gap-2">
              <Card className="text-sm w-full">
                <CardHeader><CardTitle className="flex items-center gap-1 text-2xl"><Hourglass className="h-4" />進行中</CardTitle></CardHeader>
                <CardContent className="text-5xl text-right">
                  {summaryLoading && <Skeleton className="h-10 w-full" />}
                  {summary && summary.in_progress}
                </CardContent>
              </Card>
              <Card className="text-sm w-full text-primary">
                <CardHeader><CardTitle className="flex items-center gap-1 text-2xl"><CircleCheck className="h-4" />完了</CardTitle></CardHeader>
                <CardContent className="text-5xl text-right">
                  {summaryLoading && <Skeleton className="h-10 w-full" />}
                  {summary && summary.completed}
                </CardContent>
              </Card>
            </div>

            <div className="w-full" >
              <div className="flex justify-between items-end">
                <ExH><Activity className="h-5" />アクティビティ</ExH>
                <Select>
                  <SelectTrigger className="w-[100px] text-xs border-none border-b m-1" >
                    <SelectValue placeholder="2024年" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {summary && summary.years.map((year: string) => (
                      <SelectItem value={year} key={year}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className=" flex justify-center">
                <div className="p-4 rounded-md bg-card border w-full ">
                  {activityLoading &&
                    <div className="w-full space-y-2">
                      <Skeleton className="w-full h-8" />
                      <Skeleton className="w-3/4 h-8" />
                      <Skeleton className="w-1/2 h-8" />
                    </div>
                  }
                  {activity && activity.length === 0 && <div className="pl-4">No activity.</div>}
                  {activity && activity.length > 0 &&
                    <div className="flex justify-center md:w-full sm:w-[530px] w-[380px] ">
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
                    </div>
                  }
                </div>
              </div>
            </div>

            <div>
              <ExH><Footprints className="h-4" />My Projects</ExH>
              {/* <div className="flex flex-col flex-nowrap sm:flex-row sm:flex-wrap gap-3"> */}
              {summary && summary.projects.length <= 0 && <div className="pl-4">No projects.</div>}
              <div className="flex flex-wrap gap-3">
                {summaryLoading &&
                  <ExProjectSummary
                    isLoading={true}
                    projectName=""
                    start=""
                    end=""
                    tags={[]}
                    in_progress={0}
                    completed={0}
                  />
                }
                {summary && summary.projects.map((project: ProjectProps, index: number) => (
                  <ExProjectSummary
                    key={index}
                    isLoading={false}
                    projectName={project.name}
                    start={project.start.split("T")[0]}
                    end={project.end.split("T")[0]}
                    tags={project.tags}
                    in_progress={project.in_progress}
                    completed={project.completed}
                  />
                ))}
              </div>
            </div>
          </div>


          <div className="space-y-8 pt-8" >
            <div>
              <section className="relative">
                <ExH className="pt-0 pb-4 sticky top-0 h-[45px] bg-background z-10 flex items-end "><History className="h-5" />タイムライン</ExH>
                {!timelineLoading && (!timeline || timeline.length <= 0) && <div className="pl-4">No timeline.</div>}
                {timeline && timeline.length > 0 && <div className="absolute h-full w-[1px] bg-primary/30 left-4  top-0 overflow-hidden z-0"> </div>}
                <div className="pl-2">
                  {timeline && timeline.map((item: any, index: number) => {
                    const prevTimlineDate = new Date(timeline[index - 1]?.timelineDate)
                    const prevYMD = prevTimlineDate && [prevTimlineDate.getFullYear(), prevTimlineDate.getMonth() + 1, prevTimlineDate.getDate()].join("-")
                    const TimelineDate = new Date(item.timelineDate)
                    const updateYMD = [TimelineDate.getFullYear(), TimelineDate.getMonth() + 1, TimelineDate.getDate()].join("-")
                    const isLabel = prevYMD !== updateYMD
                    return (
                      <Fragment key={index}>
                        {TimelineDate && isLabel &&
                          <div className={`sticky top-[45px] bg-transparent flex items-center `}>
                            <h2 className="border border-b border-primary/30 rounded-md bg-card pl-2 pr-8 py-1 text-sm flex items-center gap-2">
                              <Calendar className="h-4" />{updateYMD}
                            </h2>
                          </div>
                        }
                        <div className={`py-4 pl-5 my-4  ${item.timelineType === "create" ? 'ml-8 border bg-card rounded-lg shadow-md' : 'ml-8 border bg-background rounded-lg'}`}>
                          <div className="text-xs text-secondary-foreground flex gap-4 items-center pb-3">
                            <span className="flex gap-2">
                              <span className="flex items-center"><Clock className="h-4 text-muted-foreground" />
                                {TimelineDate.getHours()}:{TimelineDate.getMinutes()}
                              </span>
                            </span>
                            <span className={`flex items-center ${item.timelineType === "create" ? 'text-primary' : 'text-muted-foreground'} text-xs`}>
                              {item.timelineType === "create" ? <Rocket className="h-4" /> : <Check className="h-4" />} {item.timelineType === "create" ? '作成' : '完了'}
                            </span>
                          </div>
                          <h3 className="space-y-3">
                            <span className={`pl-1 mr-1 ${item.timelineType === "create" ? '' : 'text-muted-foreground'} `}>{item.text}</span>
                            <span className="text-xs font-semibold flex gap-1 text-ex-project items-center">
                              {item.project && <span className="flex"><Box className="h-4 text-ex-project" />{item.project}</span>}
                              {item.context && <span className="flex"><Tag className="h-4 text-ex-label" />{item.project}</span>}
                            </span>
                          </h3>
                        </div>
                      </Fragment>
                    )
                  })}
                </div>
                {(timelineLoading || !timeline) && <div className="w-full flex justify-center">
                  <div className="animate-spin h-8 w-8 border-2 p-1 border-primary rounded-full border-t-transparent" />
                </div>}
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
      </main >
    </AppPageTemplate>
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


const ExProjectSummary = ({
  projectName,
  start,
  end,
  tags,
  in_progress,
  completed,
  isLoading,
}:
  {
    projectName: string,
    start: string,
    end: string,
    tags: string[],
    in_progress: number,
    completed: number,
    isLoading: boolean
  }
) => (
  <Card className="text-sm w-full lg:w-[49%]">
    <CardHeader>
      <CardTitle className="flex items-center gap-2  w-full">
        <div className={`w-[20px] text-ex-project ${!projectName && "hidden"}`}><Box /></div>
        <span className="w-full text-ex-project">
          {isLoading && <Skeleton className="w-full h-8" />}
          {projectName ? projectName : "その他"}
        </span>
        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-between text-xl gap-1"><Hourglass className="h-4" />
            <span className="text-right">
              {isLoading ? (<Skeleton className="w-10 h-10" />) : (in_progress)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xl gap-1 text-primary"><CircleCheck className="h-4" />
            <span className="text-right">
              {isLoading ? (<Skeleton className="w-10 h-10" />) : (completed)}
            </span>
          </div>
        </div>
      </CardTitle>
      <CardDescription className="flex" >
        <span>
          {start.split("T")[0]}
          {isLoading && <Skeleton className="w-20 h-7" />}
        </span><span className="px-2">〜</span><span>
          {end.split("T")[0]}
          {isLoading && <Skeleton className="w-20 h-7" />}
        </span>
      </CardDescription>
    </CardHeader>
    {tags.length > 0 &&
      <CardContent>
        <div className="flex justify-between items-end">
          {isLoading ? (<div />) : (
            <>
              {tags.length <= 0 && <div />}
              <div className="flex flex-wrap gap-2 ">
                {tags.map((tag) => (
                  <ExLabelBadge key={tag}>{tag}</ExLabelBadge>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    }
  </Card >
);