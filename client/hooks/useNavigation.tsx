import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { MessageCircle, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequestActions } from "@/api/requests";
import Loading from "@/components/shared/Loading";

export const useNavigation = () => {
  const pathname = usePathname();

  const { getRequests } = useRequestActions();
  const { data, isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
  });

  const paths = useMemo(
    () => [
      {
        name: "Chats",
        href: "/chats",
        icon: <MessageCircle />,
        active: pathname.startsWith("/chats"),
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <Users />,
        active: pathname === "/friends",
        count: !isLoading ? data.length : 0,
      },
    ],
    [pathname, data, isLoading]
  );

  return paths;
};
