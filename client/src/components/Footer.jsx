import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
        <footer className="relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 bg-white pt-10 mt-20">
        <svg className="hidden md:block absolute -bottom-[120px] -left-80 opacity-5 w-full h-full pointer-events-none" width="68"
            height="26" viewBox="0 0 68 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_8678_1074)">
                <path d="M16.141 0C13.4854 0 10.9387 1.04871 9.06091 2.91543L2.93268 9.00761C1.05492 10.8743 0 13.4061 0 16.0461C0 21.5435 4.48289 26 10.0128 26C12.6684 26 15.2152 24.9512 17.0929 23.0845L21.3319 18.8705C21.3319 18.8705 21.3319 18.8706 21.3319 18.8705L33.6827 6.59239C34.5795 5.70086 35.7958 5.2 37.0641 5.2C39.1874 5.2 40.9876 6.57576 41.6117 8.47953L45.5096 4.60457C43.7314 1.83589 40.6134 0 37.0641 0C34.4085 0 31.8617 1.04871 29.984 2.91543L13.3943 19.4076C12.4974 20.2992 11.2811 20.8 10.0128 20.8C7.37176 20.8 5.23077 18.6716 5.23077 16.0461C5.23077 14.7852 5.73459 13.5761 6.63139 12.6845L12.7596 6.59239C13.6564 5.70086 14.8727 5.2 16.141 5.2C18.2645 5.2 20.0645 6.57582 20.6887 8.47965L24.5866 4.60466C22.8084 1.83595 19.6904 0 16.141 0Z" fill="#364153" />
                <path d="M34.3188 19.4076C33.422 20.2992 32.2056 20.8 30.9373 20.8C28.8143 20.8 27.0143 19.4246 26.39 17.5211L22.4922 21.396C24.2705 24.1643 27.3883 26 30.9373 26C33.5929 26 36.1397 24.9512 38.0175 23.0845L54.6072 6.59239C55.504 5.70086 56.7203 5.2 57.9886 5.2C60.6297 5.2 62.7707 7.32839 62.7707 9.95393C62.7707 11.2148 62.2669 12.4239 61.37 13.3155L55.2419 19.4076C54.345 20.2992 53.1287 20.8 51.8604 20.8C49.7372 20.8 47.9371 19.4243 47.3129 17.5207L43.4151 21.3957C45.1933 24.1642 48.3112 26 51.8604 26C54.516 26 57.0628 24.9512 58.9405 23.0845L65.0687 16.9924C66.9465 15.1257 68.0014 12.5939 68.0014 9.95393C68.0014 4.45652 63.5186 0 57.9886 0C55.333 0 52.7863 1.04871 50.9085 2.91543L34.3188 19.4076Z" fill="#364153" />
            </g>
            <defs>
                <clipPath id="clip0_8678_1074">
                    <rect width="68" height="26" fill="white" />
                </clipPath>
            </defs>
        </svg>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            <div className="sm:col-span-2 lg:col-span-1">
                <a href="/">
                    <img src={assets.logo} alt="QuickAI Logo" className="h-10" />
                </a>
                <p className="text-sm/7 mt-6">
                    QuickAI is your ultimate AI-powered platform for creating amazing content.
                    Transform your ideas into reality with our suite of powerful AI tools.
                </p>
            </div>
            <div className="flex flex-col lg:items-center lg:justify-center">
                <div className="flex flex-col text-sm space-y-2.5">
                    <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
                    <a className="hover:text-slate-600 transition" href="#">About us</a>
                    <a className="hover:text-slate-600 transition" href="#">Careers</a>
                    <a className="hover:text-slate-600 transition" href="#">Contact us</a>
                    <a className="hover:text-slate-600 transition" href="#">Privacy policy</a>
                </div>
            </div>
            <div>
                <h2 className="font-semibold text-gray-800 mb-5">Subscribe to our newsletter</h2>
                <div className="text-sm space-y-6 max-w-sm">
                    <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                    <div className="flex items-center">
                        <input className="rounded-l-md bg-gray-100 outline-none w-full max-w-64 h-11 px-3" type="email" placeholder="Enter your email" />
                        <button className="bg-primary text-white px-6 h-11 rounded-md font-medium shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40">
                            Subscribe
                        </button>

                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t mt-6 border-slate-200">
            <p className="text-center">
                Copyright 2026 © <a href="/">QuickAI</a> All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
            </div>
        </div>
    </footer>
  )
}

export default Footer