"use client";

export default function NotificationToast({
  notification,
  onClose,
}: any) {

  if (!notification) return null;

  return (

    <div
      className="
      fixed
      top-5
      right-5
      w-[400px]
      bg-white
      border
      shadow-xl
      rounded-lg
      p-5
      z-50
      "
    >

      <h3 className="font-bold text-lg">

        {notification.title}

      </h3>

      <p className="mt-2">

        {notification.message}

      </p>

      <button
        onClick={onClose}
        className="
        mt-4
        border
        px-4
        py-2
        rounded
        "
      >
        Close
      </button>

    </div>

  );

}