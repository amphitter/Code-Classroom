import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(
  request: NextRequest
) {

  const token =
    request.cookies.get(
      "token"
    )?.value;

  const role =
    request.cookies.get(
      "role"
    )?.value;

  const pathname =
    request.nextUrl.pathname;

  /*
  |--------------------------------------------------------------------------
  | Public Routes
  |--------------------------------------------------------------------------
  */

  const publicRoutes = [

    "/login",

    "/student/login",

    "/admin/login"

  ];

  if (

    publicRoutes.includes(
      pathname
    )

  ) {

    return NextResponse.next();

  }

  /*
  |--------------------------------------------------------------------------
  | Not Logged In
  |--------------------------------------------------------------------------
  */

  if (!token) {

    return NextResponse.redirect(

      new URL(
        "/login",
        request.url
      )

    );

  }

  /*
  |--------------------------------------------------------------------------
  | Teacher Protection
  |--------------------------------------------------------------------------
  */

  if (

    pathname.startsWith(
      "/teacher"
    ) &&

    role !== "admin"

  ) {

    return NextResponse.redirect(

      new URL(
        "/login",
        request.url
      )

    );

  }

  /*
  |--------------------------------------------------------------------------
  | Student Protection
  |--------------------------------------------------------------------------
  */

  if (

    pathname.startsWith(
      "/student"
    ) &&

    role !== "student"

  ) {

    return NextResponse.redirect(

      new URL(
        "/login",
        request.url
      )

    );

  }

  return NextResponse.next();

}

export const config = {

  matcher: [

    "/teacher/:path*",

    "/student/:path*"

  ]

};