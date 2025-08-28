// import { useStore } from '@nanostores/react';
// import { netlifyConnection } from '~/lib/stores/netlify';
// import { vercelConnection } from '~/lib/stores/vercel';
// import { workbenchStore } from '~/lib/stores/workbench';
// import { classNames } from '~/utils/classNames';
// import { useEffect, useRef, useState, Suspense, lazy } from 'react';
// import { streamingState } from '~/lib/stores/streaming';

// interface HeaderActionButtonsProps {}

// // Lazy load deployment link components
// const NetlifyDeploymentLink = lazy(() =>
//   import('~/components/chat/NetlifyDeploymentLink.client').then((mod) => ({ default: mod.NetlifyDeploymentLink })),
// );
// const VercelDeploymentLink = lazy(() =>
//   import('~/components/chat/VercelDeploymentLink.client').then((mod) => ({ default: mod.VercelDeploymentLink })),
// );

// export function HeaderActionButtons({}: HeaderActionButtonsProps) {
//   const netlifyConn = useStore(netlifyConnection);
//   const vercelConn = useStore(vercelConnection);
//   const [activePreviewIndex] = useState(0);
//   const previews = useStore(workbenchStore.previews);
//   const activePreview = previews[activePreviewIndex];
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [deployingTo, setDeployingTo] = useState<'netlify' | 'vercel' | null>(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const isStreaming = useStore(streamingState);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);

//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const onVercelDeploy = async () => {
//     setIsDeploying(true);
//     setDeployingTo('vercel');
//     try {
//       const { useVercelDeploy } = await import('~/components/deploy/VercelDeploy.client');
//       await useVercelDeploy().handleVercelDeploy();
//     } finally {
//       setIsDeploying(false);
//       setDeployingTo(null);
//     }
//   };

//   const onNetlifyDeploy = async () => {
//     setIsDeploying(true);
//     setDeployingTo('netlify');
//     try {
//       const { useNetlifyDeploy } = await import('~/components/deploy/NetlifyDeploy.client');
//       await useNetlifyDeploy().handleNetlifyDeploy();
//     } finally {
//       setIsDeploying(false);
//       setDeployingTo(null);
//     }
//   };

//   return (
//     <div className="flex">
//       <div className="relative" ref={dropdownRef}>
//         <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden mr-2 text-sm">
//           <Button
//             active
//             disabled={isDeploying || !activePreview || isStreaming}
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="px-4 hover:bg-bolt-elements-item-backgroundActive flex items-center gap-2"
//           >
//             {isDeploying ? `Deploying to ${deployingTo}...` : 'Deploy'}
//             <div
//               className={classNames('i-ph:caret-down w-4 h-4 transition-transform', isDropdownOpen ? 'rotate-180' : '')}
//             />
//           </Button>
//         </div>

//         {isDropdownOpen && (
//           <div className="absolute right-2 flex flex-col gap-1 z-50 p-1 mt-1 min-w-[13.5rem] bg-bolt-elements-background-depth-2 rounded-md shadow-lg bg-bolt-elements-backgroundDefault border border-bolt-elements-borderColor">
//             <Button
//               active
//               onClick={() => {
//                 onNetlifyDeploy();
//                 setIsDropdownOpen(false);
//               }}
//               disabled={isDeploying || !activePreview || !netlifyConn.user}
//               className="flex items-center w-full px-4 py-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive gap-2 rounded-md group relative"
//             >
//               <img
//                 className="w-5 h-5"
//                 height="24"
//                 width="24"
//                 crossOrigin="anonymous"
//                 src="https://cdn.simpleicons.org/netlify"
//               />
//               <span className="mx-auto">
//                 {!netlifyConn.user ? 'No Netlify Account Connected' : 'Deploy to Netlify'}
//               </span>
//               {netlifyConn.user && (
//                 <Suspense fallback={null}>
//                   <NetlifyDeploymentLink />
//                 </Suspense>
//               )}
//             </Button>
//             <Button
//               active
//               onClick={() => {
//                 onVercelDeploy();
//                 setIsDropdownOpen(false);
//               }}
//               disabled={isDeploying || !activePreview || !vercelConn.user}
//               className="flex items-center w-full px-4 py-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive gap-2 rounded-md group relative"
//             >
//               <img
//                 className="w-5 h-5 bg-black p-1 rounded"
//                 height="24"
//                 width="24"
//                 crossOrigin="anonymous"
//                 src="https://cdn.simpleicons.org/vercel/white"
//                 alt="vercel"
//               />
//               <span className="mx-auto">{!vercelConn.user ? 'No Vercel Account Connected' : 'Deploy to Vercel'}</span>
//               {vercelConn.user && (
//                 <Suspense fallback={null}>
//                   <VercelDeploymentLink />
//                 </Suspense>
//               )}
//             </Button>
//             <Button
//               active={false}
//               disabled
//               className="flex items-center w-full rounded-md px-4 py-2 text-sm text-bolt-elements-textTertiary gap-2"
//             >
//               <span className="sr-only">Coming Soon</span>
//               <img
//                 className="w-5 h-5"
//                 height="24"
//                 width="24"
//                 crossOrigin="anonymous"
//                 src="https://cdn.simpleicons.org/cloudflare"
//                 alt="cloudflare"
//               />
//               <span className="mx-auto">Deploy to Cloudflare (Coming Soon)</span>
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// interface ButtonProps {
//   active?: boolean;
//   disabled?: boolean;
//   children?: any;
//   onClick?: VoidFunction;
//   className?: string;
// }

// function Button({ active = false, disabled = false, children, onClick, className }: ButtonProps) {
//   return (
//     <button
//       className={classNames(
//         'flex items-center p-1.5',
//         {
//           'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
//             !active,
//           'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
//           'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
//             disabled,
//         },
//         className,
//       )}
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// }
