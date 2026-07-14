"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";

export default function StudentNotificationsPage() {

  const SESSION_ID =
    process.env.NEXT_PUBLIC_SESSION_ID || "";

  const [
    notifications,
    setNotifications
  ] = useState<any[]>([]);

  useEffect(() => {

    loadNotifications();

    socket.connect();

    socket.on(
      "notification_received",
      (notification) => {

        setNotifications(
          (prev) => [
            notification,
            ...prev
          ]
        );

      }
    );

    return () => {

      socket.off(
        "notification_received"
      );

    };

  }, []);

  const loadNotifications =
    async () => {

      try {

        const response =
          await api.get(
            `/notification/${SESSION_ID}`
          );

        setNotifications(
          response.data.notifications || []
        );

      } catch (error) {

        console.error(error);

      }

    };

  const markRead =
    async (id:string) => {

      try {

        await api.put(
          `/notification/read/${id}`
        );

        setNotifications(
          (prev) =>
            prev.map(
              (item) =>
                item._id === id
                  ? {
                      ...item,
                      isRead:true
                    }
                  : item
            )
        );

      } catch (error) {

        console.error(error);

      }

    };

  return (

    <div>

      <h1 className="text-4xl font-bold">

        Notifications

      </h1>

      <div className="mt-8 border rounded">

        {
          notifications.length === 0 ? (

            <div className="p-5">

              No Notifications

            </div>

          ) : (

            notifications.map(
              (item) => (

                <div
                  key={item._id}
                  className="
                  border-b
                  p-5
                  "
                >

                  <div className="flex justify-between">

                    <div>

                      <h3 className="font-bold">

                        {item.title}

                      </h3>

                      <p className="mt-2">

                        {item.message}

                      </p>

                      <p className="text-xs text-gray-500 mt-2">

                        {
                          new Date(
                            item.createdAt
                          ).toLocaleString()
                        }

                      </p>

                    </div>

                    <div>

                      <span className="border px-3 py-1 rounded">

                        {item.type}

                      </span>

                      {
                        !item.isRead && (

                          <button
                            onClick={() =>
                              markRead(
                                item._id
                              )
                            }
                            className="
                            block
                            mt-3
                            border
                            px-3
                            py-1
                            rounded
                            "
                          >

                            Mark Read

                          </button>

                        )
                      }

                    </div>

                  </div>

                </div>

              )
            )

          )
        }

      </div>

    </div>

  );

}