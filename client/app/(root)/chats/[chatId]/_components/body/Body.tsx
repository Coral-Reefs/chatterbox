import { useMessageActions } from "@/api/messages";
import Loading from "@/components/shared/Loading";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import Message from "./Message";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatActions } from "@/api/chats";

type Props = {
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
      content: string;
      type: string;
      firstName: string;
      lastName: string;
    } | null>
  >;
  members: {
    lastSeenMessage: string;
    firstName: string;
    [key: string]: any;
  }[];
  isGroup: boolean;
};

const Body = ({ members, setEditing, setReplying, isGroup }: Props) => {
  const { chatId } = useChat();
  const { getMessages } = useMessageActions();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: getMessages,
  });
  // const { markRead } = useChatActions();
  // const { mutate: read } = useMutation({ mutationFn: markRead });

  /*
  useEffect(() => {
    if (messages && messages.length > 0) {
      read(
        { chatId, message: messages[0]._id },
        {
          onError(error) {
            console.log(error);
          },
        }
      );
    }
  }, [messages?.length, messages, chatId, read]);

  const formatSeenBy = (names: string[]) => {
    switch (names.length) {
      case 1:
        return (
          <p className="text-muted-foreground text-sm text-right">
            {`Seen by ${names[0]}`}
          </p>
        );

      case 1:
        return (
          <p className="text-muted-foreground text-sm text-right">
            {`Seen by ${names[0]} and ${names[1]}`}
          </p>
        );
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-muted-foreground text-sm text-right">{`Seen by ${
                  names[0]
                }, ${names[1]}, and ${names.length - 2} more`}</p>
              </TooltipTrigger>
              <TooltipContent>
                <ul>
                  {names.map((name, index) => {
                    return <li key={index}>{name}</li>;
                  })}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };
  const getSeenMessage = (messageId: string) => {
    const seenUsers = members
      .filter((member) => member.lastSeenMessage === messageId)
      .map((user) => user.firstName);
    if (seenUsers.length === 0) return undefined;
    return formatSeenBy(seenUsers);
  };*/

  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-1 p-3 no-scrollbar">
      {messages?.map((message: any, i: number) => {
        const lastByUser = messages[i - 1]?.user._id === message.user._id;

        // const seenMessage = message.fromCurrentUser
        //   ? getSeenMessage(message._id)
        //   : undefined;

        return (
          <Message
            key={message._id}
            isGroup={isGroup}
            lastByUser={lastByUser}
            message={message}
            // seen={seenMessage}
            setEditing={setEditing}
            setReplying={setReplying}
          />
        );
      })}
    </div>
  );
};

export default Body;
