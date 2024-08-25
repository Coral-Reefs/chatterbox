import { useUsersActions } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { reducerCases } from "@/context/constants";
import { useSocket } from "@/context/SocketContext";
import { useStateProvider } from "@/context/StateContext";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { cn } from "@/lib/utils";

type Props = {
  data: any;
};

const Container = ({ data }: Props) => {
  const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
  const socketListener = useSocket();
  const { user } = useUser();
  const [{}, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { getToken } = useUsersActions();
  const [zgVar, setZgVar] = useState<ZegoExpressEngine | undefined>(undefined);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [publishStream, setPublishStream] = useState<string | undefined>(
    undefined
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!socketListener) return;

    if (data.type === "outgoing") {
      socketListener.on("callAccepted", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }

    return () => {
      socketListener.off("callAccepted");
    };
  }, [data, socketListener]);

  const { data: returnedToken, isLoading } = useQuery({
    queryKey: ["callToken"],
    queryFn: getToken,
  });

  useEffect(() => {
    if (!isLoading && returnedToken) {
      setToken(returnedToken.token);
    }
  }, [callAccepted]);

  // useEffect(() => {
  //   const startCall = async () => {
  //     try {
  //       import("zego-express-engine-webrtc").then(
  //         async ({ ZegoExpressEngine }) => {
  //           const zg = new ZegoExpressEngine(
  //             parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!),
  //             process.env.NEXT_PUBLIC_ZEGO_SERVER_ID!
  //           );
  //           setZgVar(zg);

  //           zg.on(
  //             "roomStreamUpdate",
  //             async (room, updateType, streamList, extendedData) => {
  //               if (updateType === "ADD") {
  //                 const rmVideo = document.getElementById("remote-video");
  //                 const vd = document.createElement(
  //                   data.callType === "video" ? "video" : "audio"
  //                 ) as any;
  //                 vd.id = streamList[0].streamID;
  //                 vd.autoplay = true;
  //                 vd.playsInline = true;
  //                 vd.muted = false;
  //                 if (rmVideo) {
  //                   rmVideo.appendChild(vd);
  //                 }
  //                 zg.startPlayingStream(streamList[0].streamID, {
  //                   audio: true,
  //                   video: data.callType === "video" ? true : false,
  //                 }).then((stream) => (vd.srcObject = stream));
  //               } else if (
  //                 updateType === "DELETE" &&
  //                 zg &&
  //                 localStream &&
  //                 streamList[0].streamID
  //               ) {
  //                 zg.destroyStream(localStream);
  //                 zg.stopPublishingStream(streamList[0].streamID);
  //                 zg.logoutRoom(data.roomId.toString());
  //                 dispatch({ type: reducerCases.END_CALL });
  //               }
  //             }
  //           );

  //           await zg.loginRoom(
  //             data.roomId.toString(),
  //             token!,
  //             {
  //               userID: user!.id,
  //               userName: user?.firstName + " " + user?.lastName,
  //             },
  //             { userUpdate: true }
  //           );

  //           try {
  //             const localStream = await zg.createStream({
  //               camera: {
  //                 audio: true,
  //                 video: data.callType === "video" ? true : false,
  //               },
  //             });
  //             setLocalStream(localStream);

  //             const localVideo = document.getElementById("local-audio");
  //             const videoElement = document.createElement(
  //               data.callType === "video" ? "video" : "audio"
  //             ) as any;
  //             videoElement.id = "video-local-zego";
  //             videoElement.className = "h-28 w-32";
  //             videoElement.autoplay = true;
  //             videoElement.muted = true;
  //             videoElement.playsInline = true;
  //             localVideo?.appendChild(videoElement);

  //             videoElement.srcObject = localStream;

  //             const streamID = "123" + Date.now();
  //             setPublishStream(streamID);
  //             zg.startPublishingStream(streamID, localStream);
  //           } catch (error) {
  //             setCameraError("No camera detected or permission denied.");
  //             console.error("Error creating local stream:", error);
  //           }
  //         }
  //       );
  //     } catch (error) {
  //       console.error("Error initializing call:", error);
  //     }
  //   };

  //   if (token) {
  //     startCall();
  //   }
  // }, [token]);

  const generateKitToken = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiredTimestamp = currentTimestamp + 7200; // Token validity period (e.g., 2 hours)
    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!),
      process.env.NEXT_PUBLIC_ZEGO_SERVER_ID!,
      data.roomId.toString(),
      user!.id,
      user?.firstName + " " + user?.lastName,
      expiredTimestamp
    );
    return token;
  };

  useEffect(() => {
    if (callAccepted) {
      const myToken = generateKitToken();
      const zp = ZegoUIKitPrebuilt.create(myToken);
      zp.joinRoom({
        container: document.querySelector("#root") as any,
        sharedLinks: [
          {
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              data.roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        onLeaveRoom: () => {
          endCall();
          zp.destroy();
        },
        onUserLeave(users) {
          if (users.length == 1) zp.destroy();
        },
      });
    }
    return () => {
      // Remove event listeners
      socketListener?.off("rejectVoiceCall");
      socketListener?.off("rejectVideoCall");
    };
  }, [callAccepted, token, data, socketListener]);

  const endCall = () => {
    const id = data._id;
    if (data.callType === "voice") {
      socket.emit("rejectVoiceCall", { from: id });
    } else {
      socket.emit("rejectVideoCall", { from: id });
    }

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-3 items-center">
        {(!callAccepted || data.callType === "voice") && (
          <span className="text-5xl">
            {data.firstName} {data.lastName}
          </span>
        )}
        <span className="text-lg">
          {callAccepted ? (
            data.callType !== "video" && "Ongoing call"
          ) : (
            <span className="animate-pulse">Calling...</span>
          )}
        </span>
      </div>

      {(!callAccepted || data.callType === "voice") && (
        <>
          <div className="my-24">
            <Avatar className="w-72 h-72">
              <AvatarImage src={data.image} alt="Profile picture" />
              <AvatarFallback>{data.firstName.substring(0, 1)}</AvatarFallback>
            </Avatar>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="w-16 h-16"
            onClick={endCall}
          >
            <Phone className="rotate-[135deg]" />
          </Button>
        </>
      )}

      {callAccepted && (
        <div
          id="root"
          className={cn("w-screen h-screen", {
            hidden: data.callType === "voice",
          })}
        ></div>
      )}
    </div>
  );
};

export default Container;
