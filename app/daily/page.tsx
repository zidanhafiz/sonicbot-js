'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const validationSchema = z.object({
  privateKey: z.string().min(10).trim(),
})

type ValidationSchema = z.infer<typeof validationSchema>

const DailyPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  })
  const [logs, setLogs] = useState<string[]>([])

  const onSubmit = async (data: ValidationSchema) => {
    const res = await axios.post("/api/daily/login", data);

    if (res.status !== 200) {
      console.error(res.data.error);
      setLogs((prev) => [...prev, res.data.error]);
      return;
    }

    setLogs((prev) => [...prev, res.data.success]);
  }

  return (
    <div className='p-6 pt-10 max-w-xl mx-auto'>
      <Link href='/' className="">〱 Back</Link>
      <h1 className='text-2xl font-bold text-center mt-5'>Daily Claim</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-16 space-y-6">
        <input
          type='text'
          placeholder='Your private key'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("privateKey")}
        />
        {errors.privateKey && <p className='text-red-400'>Private key is required</p>}
        <button type="submit" className='btn btn-primary w-full mt-5' disabled={isSubmitting} >Claim</button>
      </form>
      <div className='mt-10 border-slate-600 border rounded-lg p-3 max-h-[200px] max-w-full overflow-scroll'>
        {logs.map((log, index) => (
          <p
            key={index}
            className={`${log.includes("success") ? "text-green-400" : "text-red-400"} p-2 w-max`}
          >
            {log}
          </p>
        ))}
      </div>
    </div>
  )
}

export default DailyPage