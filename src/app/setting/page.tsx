'use client'

import { Button } from "@/components/ui/button";
import { Cross1Icon, CrossCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Home() {

  return (
    <article className="h-screen bg-sky-50/50">
      <div className={`px-20 py-10 w-full`}>
        <div className="flex justify-between content-center py-10">
          <span className="text-2xl">情報・設定</span>
          <Link href={"/"}><CrossCircledIcon className="scale-150" /></Link>

        </div>
        <div className="p-2 ">
          <ul>
            <li>Auto Save</li>
          </ul>
        </div>
      </div>
    </article >
  );
}
