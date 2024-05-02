"use client"
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import Login from "../login/page";
// import { getAllBlogs } from "../../../../blogapp-backend/src/blog/blog.controller";
const queryClient = new QueryClient()

export default function App() {
    return (
    <QueryClientProvider client={queryClient}>
            <Blogs />
    </QueryClientProvider>
        // <Blogs />
    )
    
}
// async function getData() {
//     const res = await fetch("http://localhost:3001/blogs/get-allBlogs")
//     return res.json()
// }
function Blogs() {
   const { isPending, error, data } = useQuery({
        queryKey: ["allBlogs"],
        queryFn: () =>
              fetch("http://localhost:3001/blogs/get-allBlogs").then((res)=>res.json())
        
    })
    if (isPending) return "Loading..."
    if (error) return "An error has occured" + error.message
    // const data = await getData();
    return (
        <>
            
            <h1>Blogs</h1>
             {data.data?.map(blog => (
                <div key={blog.id}>
                    <h2>{blog.title}</h2>
                    <p>{blog.content}</p>
                </div>
            ))}
           </>
    )
    
}