import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';



const isPublicRoute = createRouteMatcher([
    '/sign-in',
    '/sign-up',
    '/',
    '/home'
])
const isPublicApiRoute = createRouteMatcher([
    '/api/video'
])

export default clerkMiddleware( async (auth, req)=>{
    const { userId } = await auth();
    const currentUrl = new URL(req.url)
    const isAccessingHome = currentUrl.pathname == "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")
    // if logged in
    if(userId && isPublicRoute(req) && !isAccessingHome){
        return NextResponse.redirect(new URL("/home", req.url))
    }
    //not logged in
    if(!userId){
        if(!isPublicRoute(req) && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }
        // if request is for protected api and user's not logged in, mtlb api request hai && but the api isnt a part of the public api but a protected one thus the !isPublicApiRoute
        if(isApiRequest && !isPublicApiRoute(req)){
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }
    }
    return NextResponse.next()
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}