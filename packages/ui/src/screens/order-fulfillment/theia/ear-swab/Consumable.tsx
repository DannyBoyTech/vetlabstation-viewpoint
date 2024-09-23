import { useDomId } from "../../../../utils/hooks/domId";

const GRADIENTS = {
  filled1: ["#9ae8f0", "#00929f"],
  filled2: ["#00b1c1", "#06737d"],
  empty: ["#d9d9d9", "#ffffff"],
} as const;

export interface ConsumableProps {
  className?: string;
  ["data-testid"]?: string;

  leftFilled?: boolean;
  rightFilled?: boolean;

  onLeftChamberClick?: () => void;
  onRightChamberClick?: () => void;
}

export const Consumable = (props: ConsumableProps) => {
  const domId = useDomId();

  const { onLeftChamberClick, onRightChamberClick } = props;
  const handleLeftChamberClick = () => {
    onLeftChamberClick?.();
  };

  const handleRightChamberClick = () => {
    onRightChamberClick?.();
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={193}
      height={329}
      viewBox="0 0 193 329"
      fill="none"
      className={props.className}
      data-testid={props["data-testid"]}
    >
      <defs>
        <linearGradient
          id={domId("theia_ear_swab_consumable_right_chamber_gradient_filled")}
          x1={137.725}
          x2={46.917}
          y1={36.504}
          y2={246.795}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled1[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled1[1]} />
        </linearGradient>
        <linearGradient
          id={domId("theia_ear_swab_consumable_right_chamber_gradient_empty")}
          x1={137.725}
          x2={46.917}
          y1={36.504}
          y2={246.795}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_right_chamber_hole_gradient_filled"
          )}
          x1={91.5}
          x2={122.168}
          y1={205.871}
          y2={123.68}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled2[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled2[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_right_chamber_hole_gradient_empty"
          )}
          x1={91.5}
          x2={122.168}
          y1={205.871}
          y2={123.68}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_right_chamber_hole_gradient2_filled"
          )}
          x1={97.678}
          x2={118.335}
          y1={202.112}
          y2={138.518}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled2[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled2[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_right_chamber_hole_gradient2_empty"
          )}
          x1={97.678}
          x2={118.335}
          y1={202.112}
          y2={138.518}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId("theia_ear_swab_consumable_left_chamber_gradient_filled")}
          x1={56.725}
          x2={-34.083}
          y1={36.504}
          y2={246.795}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled1[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled1[1]} />
        </linearGradient>
        <linearGradient
          id={domId("theia_ear_swab_consumable_left_chamber_gradient_empty")}
          x1={56.725}
          x2={-34.083}
          y1={36.504}
          y2={246.795}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_left_chamber_hole_gradient_filled"
          )}
          x1={10.5}
          x2={41.168}
          y1={205.871}
          y2={123.68}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled2[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled2[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_left_chamber_hole_gradient_empty"
          )}
          x1={10.5}
          x2={41.168}
          y1={205.871}
          y2={123.68}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_left_chamber_hole_gradient2_filled"
          )}
          x1={16.678}
          x2={37.335}
          y1={202.112}
          y2={138.518}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.filled2[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.filled2[1]} stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={domId(
            "theia_ear_swab_consumable_left_chamber_hole_gradient2_empty"
          )}
          x1={16.678}
          x2={37.335}
          y1={202.112}
          y2={138.518}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={GRADIENTS.empty[0]} stopOpacity={0.4} />
          <stop offset={1} stopColor={GRADIENTS.empty[1]} stopOpacity={0} />
        </linearGradient>
        <filter
          id={domId("theia_ear_swab_consumable_svg__a")}
          width={191.447}
          height={328.046}
          x={0.826}
          y={0.826}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.035} />
          <feGaussianBlur stdDeviation={2.587} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.46 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3_11134"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_3_11134"
            result="shape"
          />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__b")}
          width={181.098}
          height={320.802}
          x={6}
          y={6}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__c")}
          width={166.61}
          height={43.464}
          x={13.244}
          y={275.06}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__e")}
          width={174.889}
          height={262.851}
          x={13.244}
          y={12.209}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dx={4.139} dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3_11134"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_3_11134"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect2_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__f")}
          width={75.544}
          height={12.418}
          x={58.777}
          y={13.244}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__g")}
          width={76.579}
          height={9.314}
          x={58.777}
          y={13.244}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dx={1.035} dy={1.035} />
          <feGaussianBlur stdDeviation={4.139} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__h")}
          width={113.913}
          height={53.836}
          x={38.08}
          y={207.795}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.035} />
          <feGaussianBlur stdDeviation={0.517} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3_11134"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_3_11134"
            result="shape"
          />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__i")}
          width={61.056}
          height={147.826}
          x={106.662}
          y={70.16}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={5.017} />
          <feGaussianBlur stdDeviation={3.136} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__k")}
          width={66.946}
          height={146.91}
          x={103.594}
          y={70.198}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.035} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3_11134"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_3_11134"
            result="shape"
          />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__l")}
          width={34.882}
          height={32.803}
          x={119.997}
          y={178.261}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dx={1.042} dy={4.169} />
          <feGaussianBlur stdDeviation={3.127} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__o")}
          width={61.056}
          height={147.826}
          x={25.662}
          y={70.16}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={5.017} />
          <feGaussianBlur stdDeviation={3.136} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__q")}
          width={66.946}
          height={146.91}
          x={22.877}
          y={70.198}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.035} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3_11134"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_3_11134"
            result="shape"
          />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__r")}
          width={34.882}
          height={32.803}
          x={38.997}
          y={178.261}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dx={1.042} dy={4.169} />
          <feGaussianBlur stdDeviation={3.127} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <filter
          id={domId("theia_ear_swab_consumable_svg__u")}
          width={15.523}
          height={19.662}
          x={87.753}
          y={232.631}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4.139} />
          <feGaussianBlur stdDeviation={2.07} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0" />
          <feBlend in2="shape" result="effect1_innerShadow_3_11134" />
        </filter>
        <pattern
          id={domId("theia_ear_swab_consumable_svg__v")}
          width={1}
          height={1}
          patternContentUnits="objectBoundingBox"
        >
          <use
            xlinkHref="#theia_ear_swab_consumable_svg__w"
            transform="matrix(.00431 0 0 .00447 0 -.01)"
          />
        </pattern>
        <image
          xlinkHref="data:image/png;base64,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"
          id={domId("theia_ear_swab_consumable_svg__w")}
          width={232}
          height={228}
        />
      </defs>
      <g filter={`url(#${domId("theia_ear_swab_consumable_svg__a")})`}>
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__b")})`}>
          <path
            fill="#F4F4F4"
            d="M187.098 277.13c0 25.147-20.386 45.533-45.533 45.533H51.533C26.386 322.663 6 302.277 6 277.13V26.697C6 15.267 15.267 6 26.697 6h139.704c11.431 0 20.697 9.266 20.697 20.697V277.13Z"
          />
        </g>
        <path
          stroke="#fff"
          strokeWidth={5.174}
          d="M184.511 277.13c0 23.718-19.228 42.946-42.946 42.946H51.533c-23.718 0-42.946-19.228-42.946-42.946V26.697c0-10.002 8.108-18.11 18.11-18.11h139.704c10.002 0 18.11 8.108 18.11 18.11V277.13Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__c")})`}>
          <mask id={domId("theia_ear_swab_consumable_svg__d")} fill="#fff">
            <path d="M179.854 276.932c0 20.684-16.767 37.452-37.451 37.452H50.696c-20.684 0-37.452-16.768-37.452-37.452 0-1.034.838-1.872 1.873-1.872h162.865c1.034 0 1.872.838 1.872 1.872Z" />
          </mask>
          <path
            stroke="#CCCFD1"
            strokeOpacity={0.1}
            strokeWidth={6.209}
            d="M179.854 276.932c0 20.684-16.767 37.452-37.451 37.452H50.696c-20.684 0-37.452-16.768-37.452-37.452 0-1.034.838-1.872 1.873-1.872h162.865c1.034 0 1.872.838 1.872 1.872Z"
            mask={`url(#${domId("theia_ear_swab_consumable_svg__d")})`}
          />
        </g>
        <path
          stroke="#fff"
          strokeWidth={3.105}
          d="M142.403 315.936c21.541 0 39.004-17.462 39.004-39.004a3.425 3.425 0 0 0-3.425-3.424H15.117a3.424 3.424 0 0 0-3.425 3.424c0 21.542 17.462 39.004 39.004 39.004h91.707Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__e")})`}>
          <path
            stroke="#CCCFD1"
            strokeOpacity={0.01}
            strokeWidth={3.105}
            d="M178.302 263.677c0 .857-.695 1.552-1.552 1.552H16.349a1.552 1.552 0 0 1-1.553-1.552V27.732c0-7.716 6.255-13.97 13.97-13.97h135.566c7.715 0 13.97 6.254 13.97 13.97v235.945Z"
            shapeRendering="crispEdges"
          />
        </g>
        <path
          stroke="#fff"
          strokeWidth={7.244}
          d="M176.75 270.403a6.726 6.726 0 0 0 6.726-6.726V27.732c0-10.574-8.571-19.145-19.144-19.145H28.767c-10.573 0-19.145 8.571-19.145 19.145v235.945a6.726 6.726 0 0 0 6.727 6.726H176.75Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__f")})`}>
          <g filter={`url(#${domId("theia_ear_swab_consumable_svg__g")})`}>
            <rect
              width={75.544}
              height={8.279}
              x={134.321}
              y={21.522}
              fill="#fff"
              fillOpacity={0.02}
              rx={2.07}
              transform="rotate(-180 134.321 21.522)"
            />
          </g>
        </g>
        <path
          fill="#CCCFD1"
          fillRule="evenodd"
          d="M43.607 293.832v9.169l2.891-.015 2.892-.014.014-9.155.014-9.154h-5.811v9.169Zm8.068-5.332v3.836H57.317V289.233h4.867c5.682 0 5.867.013 6.855.479.92.434 1.532 1.385 1.535 2.385l.001.239h5.642v-.726c0-2.656-1.227-4.699-3.52-5.856-.99-.501-2.47-.898-3.838-1.031-.404-.039-3.475-.06-8.9-.06h-8.284v3.837Zm26.46 0v3.836H83.778v-3.384l7.18-.015 7.18-.014.028-2.085.028-2.085 3.47 3.788 3.47 3.789 5.171.003 5.172.003 2.638-2.877c1.45-1.583 2.655-2.877 2.678-2.877.022 0 1.229 1.294 2.68 2.877l2.64 2.877 5.167-.002 5.167-.002 3.469-3.788c1.909-2.084 3.479-3.809 3.489-3.834.01-.026-1.64-.046-3.667-.046l-3.686.001-2.392 2.824c-1.315 1.553-2.409 2.803-2.431 2.778l-2.394-2.825-2.354-2.779H115.107l-2.336 2.747a537.572 537.572 0 0 0-2.395 2.828c-.048.064-.55-.497-2.455-2.746l-2.394-2.827-13.695-.001-13.696-.001v3.837Zm7.56 5.219v1.664h12.188V292.054H85.696v1.665Zm-7.546 5.204.015 4.049h27.359l2.366-2.793c1.301-1.536 2.384-2.8 2.405-2.809.021-.008 1.085 1.216 2.365 2.722a365.553 365.553 0 0 0 2.411 2.823c.075.074.772.085 5.737.085h5.652l2.391-2.821c1.315-1.552 2.407-2.82 2.426-2.819.019.002 1.076 1.235 2.349 2.74a233.65 233.65 0 0 0 2.402 2.819c.077.07.631.08 3.849.067l3.759-.014-3.679-3.935-3.68-3.934h-4.993l-4.993-.001-2.736 2.988c-1.505 1.644-2.752 2.983-2.772 2.976-.019-.007-1.262-1.352-2.763-2.989l-2.729-2.976h-9.954l-3.572 3.893-3.571 3.892-.028-2.157-.029-2.158-7.179-.014-7.18-.015v-3.667H78.136l.014 4.048Zm-26.46.113.014 3.936h8.406c7.804 0 8.46-.008 9.156-.103 3.155-.43 5.234-1.683 6.29-3.79.454-.907.662-1.894.662-3.14v-.839l-2.806.015-2.807.014-.04.405c-.137 1.365-.97 2.226-2.487 2.573-.504.115-.675.119-5.64.139l-5.12.02v-3.165H51.674l.014 3.935Z"
          clipRule="evenodd"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__h")})`}>
          <path
            fill="#fff"
            fillOpacity={0.6}
            fillRule="evenodd"
            d="M67.286 212.931s-48.64-14.485-15.68 10.988c5.371 4.15 15.765 8.636 15.765 8.636s2.637 14.392 10.031 20.727c4.994 4.279 15.381 5.063 18.013 5.195v.025s.107-.002.305-.011c.203.009.312.011.312.011v-.025c2.592-.133 12.694-.913 17.555-5.131 7.212-6.258 9.785-20.475 9.785-20.475s10.139-4.431 15.377-8.531c32.151-25.162-15.294-10.854-15.294-10.854s4.04 1.286.517 4.657c0 0-1.552 2.587-8.796 4.14-6.736 1.443-19.76 1.489-19.76 1.489v.036c-2.702-.126-13.622-.698-19.643-1.972-7.426-1.572-9.017-4.191-9.017-4.191-3.612-3.413.53-4.714.53-4.714Z"
            clipRule="evenodd"
            shapeRendering="crispEdges"
          />
          <path
            fill="#CCCFD1"
            fillOpacity={0.02}
            d="m51.607 223.919-.633.819.633-.819Zm15.68-10.988.31.987 3.226-1.013-3.241-.966-.296.992Zm.084 19.624 1.017-.186-.1-.545-.507-.219-.41.95Zm10.031 20.727.673-.786-.673.786Zm18.013 5.195h1.035v-.984l-.983-.049-.052 1.033Zm0 .025H94.38v1.059l1.06-.024-.025-1.035Zm.305-.011.043-1.034-.043-.001-.044.001.044 1.034Zm.312.011-.024 1.035 1.059.024v-1.059h-1.035Zm0-.025-.053-1.034-.982.051v.983h1.035Zm17.555-5.131.679.781-.679-.781Zm9.785-20.475-.414-.948-.506.221-.098.543 1.018.184Zm15.377-8.531.638.815-.638-.815Zm-15.294-10.854-.299-.99-3.198.964 3.183 1.013.314-.987Zm.517 4.657-.715-.747-.101.096-.071.119.887.532Zm-8.796 4.14-.216-1.012.216 1.012Zm-19.76 1.489-.004-1.035-1.032.003v1.032h1.035Zm0 .036-.049 1.033 1.083.051v-1.084h-1.035Zm-19.643-1.972-.214 1.012.214-1.012Zm-9.017-4.191.884-.537-.072-.119-.102-.096-.71.752ZM52.24 223.1c-4.099-3.167-6.887-5.682-8.651-7.656-.881-.987-1.487-1.816-1.871-2.503-.389-.695-.521-1.189-.532-1.52-.01-.296.073-.483.216-.639.167-.183.474-.382.995-.548 1.056-.336 2.654-.436 4.633-.328 3.923.213 8.898 1.209 12.932 2.167a152.338 152.338 0 0 1 6.5 1.696c.173.05.306.088.395.115l.101.029.025.008.006.001.002.001.295-.992.295-.992-.002-.001-.007-.002-.028-.008-.106-.031-.405-.117a157.383 157.383 0 0 0-6.593-1.721c-4.056-.963-9.18-1.996-13.297-2.22-2.041-.111-3.948-.031-5.374.423-.72.229-1.397.578-1.894 1.123-.523.57-.785 1.29-.758 2.106.027.78.315 1.604.794 2.46.483.863 1.192 1.817 2.135 2.872 1.885 2.11 4.786 4.714 8.928 7.915l1.266-1.638Zm15.13 9.455.41-.95a1.665 1.665 0 0 0-.026-.012l-.087-.037a100.75 100.75 0 0 1-1.573-.707 132.742 132.742 0 0 1-4.127-1.981c-3.262-1.636-7.127-3.758-9.727-5.768l-1.266 1.638c2.77 2.14 6.787 4.336 10.065 5.98a134.177 134.177 0 0 0 5.455 2.582l.344.152.09.039.024.011.006.002.002.001.41-.95Zm10.705 19.941c-3.485-2.986-5.919-7.954-7.488-12.304a58.27 58.27 0 0 1-1.685-5.541 49.287 49.287 0 0 1-.485-2.133l-.022-.115a1.727 1.727 0 0 1-.005-.027l-.001-.006v-.002l-1.018.187-1.018.187v.004l.002.01.007.034.025.129a51.406 51.406 0 0 0 .508 2.235c.368 1.474.939 3.505 1.745 5.74 1.598 4.43 4.18 9.825 8.089 13.174l1.346-1.572Zm17.392 4.948c-1.289-.065-4.484-.29-7.96-1.022-3.513-.739-7.141-1.963-9.432-3.926l-1.346 1.572c2.703 2.316 6.765 3.624 10.352 4.38 3.624.763 6.939.996 8.282 1.063l.104-2.067Zm-1.087 1.033v.025h2.07v-.025h-2.07Zm1.035.025.024 1.035h.008l.017-.001.063-.002c.054-.002.134-.004.236-.009l-.087-2.068-.216.009-.054.001-.012.001h-.003l.024 1.034Zm.617 0 .024-1.034h-.003l-.013-.001-.055-.001-.222-.009-.086 2.068c.105.005.186.008.242.009l.064.002.018.001h.006l.025-1.035Zm-1.035-.025v.025h2.07v-.025h-2.07Zm1.088 1.033c1.323-.067 4.557-.3 8.09-1.055 3.495-.747 7.453-2.039 10.091-4.328l-1.357-1.563c-2.224 1.93-5.748 3.137-9.167 3.867-3.382.723-6.495.947-7.763 1.012l.106 2.067Zm18.181-5.383c3.816-3.311 6.335-8.643 7.893-13.018a60.082 60.082 0 0 0 1.703-5.67 50.117 50.117 0 0 0 .495-2.208l.025-.128a.421.421 0 0 0 .006-.034l.002-.009v-.003l.001-.001-1.019-.185-1.018-.184v.001l-.001.006-.005.027-.022.113a47.543 47.543 0 0 1-.473 2.108 58.265 58.265 0 0 1-1.643 5.473c-1.531 4.297-3.905 9.202-7.301 12.149l1.357 1.563Zm9.106-21.256.415.948h.001l.001-.001a.014.014 0 0 0 .006-.002l.023-.01.089-.039.335-.15a129.265 129.265 0 0 0 5.323-2.551c3.197-1.624 7.118-3.795 9.822-5.911l-1.276-1.63c-2.535 1.984-6.302 4.079-9.483 5.696a128.619 128.619 0 0 1-5.56 2.653l-.083.037a.648.648 0 0 1-.021.009l-.005.003h-.001l.414.948Zm16.015-7.716c4.04-3.162 6.871-5.735 8.711-7.821 1.795-2.033 2.809-3.779 2.859-5.271.027-.805-.229-1.517-.741-2.084-.489-.541-1.154-.888-1.86-1.116-1.397-.45-3.263-.529-5.255-.419-4.019.221-9.021 1.243-12.977 2.194a150.998 150.998 0 0 0-6.433 1.7l-.395.116-.103.031-.027.008-.007.002h-.002c-.001.001-.001.001.298.991l.299.991h.001l.006-.002.024-.007.099-.03.384-.112a149.164 149.164 0 0 1 6.339-1.676c3.935-.946 8.785-1.929 12.608-2.139 1.93-.107 3.483-.008 4.506.322.504.163.799.357.959.534.137.151.218.334.208.628-.023.706-.577 1.97-2.342 3.97-1.719 1.948-4.438 4.432-8.435 7.56l1.276 1.63Zm-15.932-11.669c-.314.987-.315.986-.315.986h-.001l-.001-.001h-.002c-.001 0-.001 0 0 0l.016.005a3.013 3.013 0 0 1 .391.176c.26.139.511.321.67.528a.704.704 0 0 1 .149.614c-.06.303-.305.836-1.105 1.602l1.431 1.495c.961-.92 1.531-1.813 1.705-2.699a2.77 2.77 0 0 0-.537-2.271c-.411-.536-.949-.886-1.337-1.094a5.44 5.44 0 0 0-.723-.318l-.017-.005a.014.014 0 0 0-.006-.002l-.002-.001h-.002c0-.001-.001-.001-.314.985Zm.517 4.657a43.314 43.314 0 0 1-.886-.534v-.001l.002-.003.003-.005.004-.006.002-.003a2.447 2.447 0 0 1-.224.26c-.202.209-.562.532-1.146.912-1.169.76-3.245 1.753-6.767 2.508l.433 2.023c3.722-.797 6.043-1.874 7.462-2.796.709-.461 1.19-.881 1.504-1.206a4.302 4.302 0 0 0 .481-.584l.011-.018.005-.008.002-.003.001-.002c0-.001.001-.002-.887-.534Zm-9.012 3.128c-3.277.702-8.141 1.072-12.239 1.264a196.501 196.501 0 0 1-6.744.197l-.421.004-.109.001h-.035l.003 1.035.004 1.034h.151l.43-.004a198.433 198.433 0 0 0 6.819-.2c4.098-.192 9.114-.566 12.574-1.308l-.433-2.023Zm-20.58 2.501v.036h2.07v-.036h-2.07Zm-18.821-.924c6.119 1.295 17.13 1.869 19.808 1.993l.096-2.067c-2.723-.127-13.553-.697-19.476-1.951l-.428 2.025Zm-8.803-5.203c-.885.538-.884.538-.884.539l.001.002.002.003.005.008a.376.376 0 0 1 .012.018l.03.047c.026.036.058.081.1.134.082.106.2.245.36.408.321.328.813.753 1.538 1.218 1.451.931 3.827 2.02 7.639 2.826l.428-2.025c-3.615-.765-5.747-1.771-6.948-2.543-.601-.385-.971-.713-1.18-.926a2.618 2.618 0 0 1-.23-.263l.005.007.003.004.001.003.001.002s.001.001-.883.538Zm.53-4.714-.311-.987-.001.001h-.003a.162.162 0 0 1-.023.008l-.05.017a5.428 5.428 0 0 0-.685.303c-.396.208-.944.561-1.364 1.101a2.773 2.773 0 0 0-.549 2.297c.178.896.762 1.798 1.745 2.726l1.421-1.504c-.822-.777-1.075-1.318-1.136-1.626a.709.709 0 0 1 .154-.624c.165-.212.426-.398.695-.54a3.53 3.53 0 0 1 .422-.186H67.6l-.002.001c-.001 0-.002 0-.312-.987Z"
          />
        </g>
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__i")})`}>
          <path
            onClick={handleRightChamberClick}
            fill={`url(#${domId(
              `theia_ear_swab_consumable_right_chamber_gradient_${
                props.rightFilled ? "filled" : "empty"
              }`
            )})`}
            d="M160.008 70.16a7.71 7.71 0 0 1 7.71 7.71v96.269a7.713 7.713 0 0 1-1.74 4.879l-6.392 7.82a7.707 7.707 0 0 0-1.739 4.694l-.333 13.912a7.71 7.71 0 0 1-7.708 7.525H123.42a7.709 7.709 0 0 1-7.707-7.525l-.34-14.169a7.71 7.71 0 0 0-1.454-4.326l-5.8-8.04a7.716 7.716 0 0 1-1.457-4.511V77.87a7.71 7.71 0 0 1 7.71-7.71h45.636Z"
          />
        </g>
        <path
          stroke="#DDD"
          strokeOpacity={0.96}
          strokeWidth={1.611}
          d="M160.008 70.966a6.904 6.904 0 0 1 6.905 6.904v96.269a6.904 6.904 0 0 1-1.559 4.369l-6.392 7.82a8.512 8.512 0 0 0-1.92 5.185l-.333 13.912a6.904 6.904 0 0 1-6.903 6.738H123.42a6.904 6.904 0 0 1-6.902-6.738l-.339-14.17a8.524 8.524 0 0 0-1.607-4.777l-5.8-8.041a6.905 6.905 0 0 1-1.304-4.039V77.87a6.904 6.904 0 0 1 6.904-6.904h45.636Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__k")})`}>
          <path
            stroke="#fff"
            strokeOpacity={0.96}
            strokeWidth={3.105}
            d="M168.988 80.307c0-9.054-12.236-11.886-16.214-3.753a5.438 5.438 0 0 1-4.884 3.048h-21.645a5.437 5.437 0 0 1-4.884-3.048c-3.978-8.133-16.214-5.301-16.214 3.753v92.773c0 1.88.572 3.716 1.64 5.263l5.932 8.589a6.164 6.164 0 0 1 1.09 3.358l.348 15.182a9.261 9.261 0 0 0 9.259 9.049h26.155a9.261 9.261 0 0 0 9.259-9.049l.343-14.929a6.157 6.157 0 0 1 1.307-3.654l6.54-8.356a9.262 9.262 0 0 0 1.968-5.708V80.307Z"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__l")})`}>
          <path
            fill={`url(#${domId(
              `theia_ear_swab_consumable_right_chamber_hole_gradient2_${
                props.rightFilled ? "filled" : "empty"
              }`
            )})`}
            d="M149.358 181.382c1.151 0 2.085.933 2.085 2.084v17.33a2.085 2.085 0 0 1-2.085 2.084h-25.017a2.085 2.085 0 0 1-2.085-2.084v-17.33c0-1.151.934-2.084 2.085-2.084h25.017Z"
          />
          <path
            fill={`url(#${domId(
              `theia_ear_swab_consumable_right_chamber_hole_gradient_${
                props.rightFilled ? "filled" : "empty"
              }`
            )})`}
            stroke="#fff"
            strokeWidth={2.603}
            d="M147.428 179.563a5.106 5.106 0 0 1 5.106 5.106v15.818a5.106 5.106 0 0 1-5.106 5.106h-21.024a5.106 5.106 0 0 1-5.106-5.106v-15.818a5.106 5.106 0 0 1 5.106-5.106h21.024Z"
          />
        </g>
        <path
          fill="#fff"
          d="M159.157 70.16a16.24 16.24 0 0 1-14.155 8.28h-18.705a10.93 10.93 0 0 1-10.603-8.28h43.463Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__o")})`}>
          <path
            onClick={handleLeftChamberClick}
            fill={`url(#${domId(
              `theia_ear_swab_consumable_left_chamber_gradient_${
                props.leftFilled ? "filled" : "empty"
              }`
            )})`}
            d="M79.008 70.16a7.71 7.71 0 0 1 7.71 7.71v96.269a7.71 7.71 0 0 1-1.74 4.879l-6.392 7.82a7.71 7.71 0 0 0-1.739 4.695l-.333 13.911a7.71 7.71 0 0 1-7.708 7.525H42.42a7.71 7.71 0 0 1-7.707-7.525l-.34-14.169a7.711 7.711 0 0 0-1.454-4.326l-5.8-8.04a7.709 7.709 0 0 1-1.457-4.51V77.87a7.71 7.71 0 0 1 7.71-7.71h45.636Z"
          />
        </g>
        <path
          stroke="#DDD"
          strokeOpacity={0.96}
          strokeWidth={1.611}
          d="M79.008 70.966a6.904 6.904 0 0 1 6.905 6.904v96.269c0 1.592-.551 3.136-1.559 4.369l-6.392 7.82a8.515 8.515 0 0 0-1.92 5.185l-.333 13.912a6.905 6.905 0 0 1-6.903 6.739H42.42a6.905 6.905 0 0 1-6.902-6.739l-.34-14.169a8.515 8.515 0 0 0-1.606-4.778l-5.8-8.041a6.901 6.901 0 0 1-1.304-4.038V77.87a6.904 6.904 0 0 1 6.904-6.904h45.636Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__q")})`}>
          <path
            stroke="#fff"
            strokeOpacity={0.96}
            strokeWidth={3.105}
            d="M88.27 80.307c0-9.054-12.236-11.886-16.214-3.753a5.437 5.437 0 0 1-4.884 3.048H45.527a5.437 5.437 0 0 1-4.884-3.048c-3.978-8.133-16.214-5.301-16.214 3.753v92.773c0 1.88.572 3.716 1.64 5.263l5.933 8.589a6.16 6.16 0 0 1 1.089 3.358l.348 15.182a9.262 9.262 0 0 0 9.26 9.049h26.154a9.262 9.262 0 0 0 9.26-9.049l.342-14.929a6.16 6.16 0 0 1 1.307-3.654l6.54-8.356a9.26 9.26 0 0 0 1.968-5.708V80.307Z"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__r")})`}>
          <path
            fill={`url(#${domId(
              `theia_ear_swab_consumable_left_chamber_hole_gradient2_${
                props.leftFilled ? "filled" : "empty"
              }`
            )})`}
            d="M68.358 181.382c1.151 0 2.085.933 2.085 2.084v17.33a2.085 2.085 0 0 1-2.085 2.085H43.341a2.085 2.085 0 0 1-2.085-2.085v-17.33c0-1.151.934-2.084 2.085-2.084h25.017Z"
          />
          <path
            fill={`url(#${domId(
              `theia_ear_swab_consumable_left_chamber_hole_gradient_${
                props.leftFilled ? "filled" : "empty"
              }`
            )})`}
            stroke="#fff"
            strokeWidth={2.603}
            d="M66.428 179.563a5.106 5.106 0 0 1 5.106 5.106v15.818a5.106 5.106 0 0 1-5.106 5.106H45.404a5.106 5.106 0 0 1-5.106-5.106v-15.818a5.106 5.106 0 0 1 5.106-5.106h21.024Z"
          />
        </g>
        <path
          fill="#fff"
          d="M78.44 70.16a16.241 16.241 0 0 1-14.156 8.28H45.579a10.93 10.93 0 0 1-10.603-8.28h43.463Z"
        />
        <g filter={`url(#${domId("theia_ear_swab_consumable_svg__u")})`}>
          <circle
            cx={95.514}
            cy={240.392}
            r={7.761}
            fill="#F4F6F7"
            transform="rotate(-180 95.514 240.392)"
          />
        </g>
      </g>
      <rect
        width={42.222}
        height={40.714}
        x={75.365}
        y={25.603}
        fill={`url(#${domId("theia_ear_swab_consumable_svg__v")})`}
        fillOpacity={0.2}
        rx={1.508}
      />
      <path
        fill="#CCCFD1"
        d="M35.48 59.72v2.486h-6.775V59.72h6.774Zm-5.624-10.915v13.4h-3.23v-13.4h3.23ZM154.798 48.805h5.274c1.031 0 1.926.154 2.687.46.761.307 1.347.761 1.758 1.363.417.601.626 1.343.626 2.227 0 .767-.12 1.408-.359 1.924a3.446 3.446 0 0 1-1.003 1.279 5.628 5.628 0 0 1-1.482.819l-1.058.598h-4.427l-.019-2.494h3.277c.411 0 .752-.074 1.021-.22.27-.148.473-.357.608-.627.141-.276.212-.604.212-.984 0-.387-.071-.718-.212-.994a1.455 1.455 0 0 0-.626-.636c-.27-.147-.604-.22-1.003-.22h-2.043v10.906h-3.231v-13.4Zm7.335 13.4-2.963-5.926 3.424-.019 3 5.808v.138h-3.461Z"
      />
    </svg>
  );
};
