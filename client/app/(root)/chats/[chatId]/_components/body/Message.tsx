import React, { Dispatch, SetStateAction, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Reply, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import ZoomableImage from "./ZoomableImage";
import VoiceMessage from "./VoiceMessage";
import DeleteMessageDialog from "../dialogs/DeleteMessageDialog";
import * as linkify from "linkifyjs";
import linkifyHtml from "linkify-html";

type Props = {
  isGroup: boolean;
  lastByUser: boolean;
  message: {
    user: {
      image: string;
      firstName: string;
      lastName: string;
    };
    _id: string;
    fromCurrentUser: boolean;
    content: string;
    reply: any;
    create_at: number;
    updated_at: number;
    type: string;
    file?: any;
  };
  seen?: React.ReactNode;
  setEditing: Dispatch<
    SetStateAction<{
      _id: string;
      type: string;
      content: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  setReplying: Dispatch<
    SetStateAction<{
      _id: string;
      type: string;
      content: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
};

const Message = ({
  isGroup,
  lastByUser,
  message: {
    _id,
    user: { image, firstName, lastName },
    fromCurrentUser,
    content,
    create_at,
    updated_at,
    type,
    reply,
    file,
  },
  seen,
  setEditing,
  setReplying,
}: Props) => {
  const formatTime = (timestamp: number) => {
    return format(timestamp, "hh:mm a");
  };
  const [deleteMessageDialog, setDeleteMessageDialog] = useState(false);

  const fileUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/${file?.name}`;
  const linkOptions = {
    defaultProtocol: "https",
    className: "underline underline-offset-2",
    target: "_blank",
  };
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          className={cn("flex items-end", { "justify-end": fromCurrentUser })}
        >
          <div
            className={cn("flex flex-col w-full mx-2", {
              "order-1 items-end": fromCurrentUser,
              "order-2 items-start": !fromCurrentUser,
            })}
          >
            <div
              className={cn("p-2 rounded-xl max-w-[70%] relative", {
                "bg-primary text-primary-foreground": fromCurrentUser,
                "bg-secondary text-secondary-foreground": !fromCurrentUser,
                "rounded-br-none": !lastByUser && fromCurrentUser,
                "rounded-bl-none": !lastByUser && !fromCurrentUser,
              })}
            >
              {isGroup && !fromCurrentUser && (
                <p className="text-sm px-2 font-semibold text-sky-500">
                  {firstName} {lastName}
                </p>
              )}
              {reply && (
                <Card
                  className={cn("border-0 border-l-4 p-2 mb-2", {
                    "text-primary-foreground bg-card/20": fromCurrentUser,
                    "text-secondary-foreground bg-card-foreground/10 border-l-primary":
                      !fromCurrentUser,
                  })}
                >
                  <span className="text-sm">
                    {reply.user.firstName} {reply.user.lastName}
                  </span>
                  <p>{reply.content || reply.type}</p>
                </Card>
              )}

              {type == "image" && (
                <ZoomableImage
                  imageUrl={fileUrl}
                  altText={file.name!}
                  content={content}
                />
              )}

              {type == "document" && (
                <a
                  href={fileUrl}
                  download={file.name}
                  onClick={(e) => {
                    e.preventDefault();
                    const link = document.createElement("a");
                    link.href = file;
                    link.download = file?.name.split("-")[1] || "download";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <div className="flex items-center mb-1">
                    <div className="flex items-center justify-center bg-red-500 w-16 h-16 mr-2 text-white rounded-xl">
                      {file!.name.split(".").pop()?.toLowerCase()}
                    </div>
                    <div className="max-w-80">
                      <p>{file!.name.split("-")[1]}</p>
                      <p className="text-sm opacity-50">
                        {(file!.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </a>
              )}

              {type == "voice" && <VoiceMessage file={file!} />}

              <div className="px-2">
                {content && (
                  <p
                    className="text-wrap break-words whitespace-pre-wrap break-all"
                    dangerouslySetInnerHTML={{
                      __html: linkifyHtml(content, linkOptions),
                    }}
                  ></p>
                )}
                <p
                  className={cn("text-xs opacity-70 mt-1 flex justify-end", {
                    "text-primary-foreground": fromCurrentUser,
                    "text-secondary-foreground": !fromCurrentUser,
                    "absolute bottom-1 right-4": type == "voice",
                  })}
                >
                  {create_at != updated_at && (
                    <span className="italic me-2">edited</span>
                  )}
                  {formatTime(create_at)}
                </p>
              </div>
            </div>
            {/* {seen} */}
          </div>
          <Avatar
            className={cn("relative w-8 h-8", {
              "order-2": fromCurrentUser,
              "order-1": !fromCurrentUser,
              invisible: lastByUser,
            })}
          >
            <AvatarImage src={image} />
            <AvatarFallback>{firstName.substring(0, 1)}</AvatarFallback>
          </Avatar>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() =>
              setReplying({ _id, content, type, firstName, lastName })
            }
          >
            <Reply className="w-5 me-2" />
            Reply
          </ContextMenuItem>
          {fromCurrentUser && (
            <>
              {type != "voice" && (
                <ContextMenuItem
                  onClick={() =>
                    setEditing({ _id, content, type, firstName, lastName })
                  }
                >
                  <Pencil className="w-5 h-4 me-2" />
                  Edit
                </ContextMenuItem>
              )}
              <ContextMenuItem
                className="text-red-600"
                onClick={() => setDeleteMessageDialog(true)}
              >
                <Trash2 className="w-5 h-4 me-2" />
                Delete
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <DeleteMessageDialog
        id={_id}
        open={deleteMessageDialog}
        setOpen={setDeleteMessageDialog}
      />
    </>
  );
};

export default Message;
