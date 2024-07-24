"use client";
import { delay } from "@/utils/solanaUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { set, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  fromPrivateKey: z.string().min(10).trim(),
  toPublicKey: z.string().min(10).trim(),
  transaction: z.number().lte(150).gte(1).nonnegative(),
  amount: z.string().min(1),
  delay: z.number().lte(1000).gte(1).nonnegative(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const SendPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const [logs, setLogs] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    abortControllerRef.current = new AbortController();

    for (let i = 0; i < data.transaction; i++) {
      try {
        const res = await axios.post("/api/transaction", data, {
          signal: abortControllerRef?.current.signal,
        });

        if (res.status !== 200) {
          console.error(res.data.error);
          setLogs((prev) => [...prev, res.data.error]);
          return;
        }

        setLogs((prev) => [...prev, res.data.success]);
        await delay(data.delay * 1000);
      } catch (error: any) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
          setLogs((prev) => [...prev, "Request canceled"]);
        } else {
          console.error(error);
          setLogs((prev) => [...prev, error.message]);
        }
        break;
      }
    }
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    }
  }, []);

  return (
    <div className='p-6 pt-10 max-w-xl mx-auto'>
      <Link href='/' className="">〱 Back</Link>
      <h1 className='text-2xl font-bold text-center mt-5'>Automatic Send</h1>
      <form
        className='mt-10 grid gap-6'
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type='text'
          placeholder='Your private key'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("fromPrivateKey")}
        />
        {errors.fromPrivateKey?.message && <span className='text-red-400 italic'>{errors.fromPrivateKey?.message}</span>}
        <input
          type='text'
          placeholder='To public key'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("toPublicKey")}
        />
        {errors.toPublicKey?.message && <span className='text-red-400 italic'>{errors.toPublicKey?.message}</span>}
        <input
          type='number'
          placeholder='Number of transactions'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("transaction", { valueAsNumber: true })}
        />
        {errors.transaction?.message && <span className='text-red-400 italic'>{errors.transaction?.message}</span>}
        <input
          type='string'
          placeholder='Amount'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("amount")}
        />
        {errors.amount?.message && <span className='text-red-400 italic'>{errors.amount?.message}</span>}
        <input
          type='number'
          placeholder='Delay in second'
          className='input input-bordered w-full'
          disabled={isSubmitting}
          {...register("delay", { valueAsNumber: true })}
        />
        {errors.delay?.message && <span className='text-red-400 italic'>{errors.delay?.message}</span>}
        <button
          className='btn btn-primary'
          type='submit'
          disabled={isSubmitting}
        >
          Run
        </button>
      </form>
      {isSubmitting && (
        <button
          className='btn btn-outline btn-error mt-5 w-full'
          onClick={handleAbort}
          disabled={!isSubmitting}
        >
          Stop
        </button>
      )}
      <div className='mt-10 border-slate-600 border rounded-lg p-3 max-h-[200px] max-w-full overflow-scroll'>
        {logs.map((log, index) => (
          <p
            key={index}
            className={`${log.includes("completed") ? "text-green-400" : "text-red-400"} p-2 w-max`}
          >
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SendPage;
