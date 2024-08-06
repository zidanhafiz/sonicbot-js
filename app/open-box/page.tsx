"use client";
import { delay } from "@/utils/solanaUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const validationSchema = z.object({
  privateKey: z.string().min(10).trim(),
  box: z.string(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const OpenPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
  const [logs, setLogs] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const onSubmit = async (data: ValidationSchema) => {
    abortControllerRef.current = new AbortController();

    for (let i = 0; i < parseInt(data.box); i++) {
      try {
        const res = await axios.post("/api/open", { privateKey: data.privateKey }, {
          signal: abortControllerRef?.current.signal,
        });

        if (res.status !== 200) {
          console.error(res.data.error);
          setLogs((prev) => [...prev, res.data.error]);
          return;
        }

        setLogs((prev) => [...prev, res.data.success]);
        await delay(3 * 1000);
      } catch (error: any) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
          setLogs((prev) => [...prev, "Request canceled"]);
        } else {
          console.error(error);
          setLogs((prev) => [...prev, error.message]);
        }
      }
      break;
    }
    setLogs((prev) => [...prev, "All transactions is complete"]);
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="p-6 pt-10 max-w-xl mx-auto">
      <Link href="/" className="">
        〱 Back
      </Link>
      <h1 className="text-2xl font-bold text-center mt-5">Open Box</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-16 space-y-6">
        <input
          type="text"
          placeholder="Your private key"
          className="input input-bordered w-full"
          disabled={isSubmitting}
          {...register("privateKey")}
        />
        {errors.privateKey && (
          <p className="text-red-400">Private key is required</p>
        )}
        <input
          type="number"
          placeholder="Box to open"
          className="input input-bordered w-full"
          disabled={isSubmitting}
          {...register("box")}
        />
        {errors.box && <p className="text-red-400">Box is required</p>}
        <button
          type="submit"
          className="btn btn-primary w-full mt-5"
          disabled={isSubmitting}
        >
          Open
        </button>
      </form>
      {isSubmitting && (
        <button
          className="btn btn-outline btn-error mt-5 w-full"
          onClick={handleAbort}
          disabled={!isSubmitting}
        >
          Stop
        </button>
      )}
      <div className="mt-10 border-slate-600 border rounded-lg p-3 max-h-[200px] max-w-full overflow-scroll">
        {logs.map((log, index) => (
          <p
            key={index}
            className={`${log.includes("Success") || log.includes("complete") ? "text-green-400" : "text-red-400"} p-2 w-max`}
          >
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};

export default OpenPage;
