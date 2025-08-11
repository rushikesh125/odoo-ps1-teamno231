
import { Button } from "@heroui/button";
import { PenBox } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
   <main>
    <h1 className=" text-center text-3xl text-theme-purple">Hello World </h1>
    <Button isIconOnly={true}>
      <PenBox/>
    </Button>
   </main>
  );
}
