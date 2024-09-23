import classnames from "classnames";
import { useDomId } from "../../../utils/hooks/domId";

export const TestId = {
  IndicatorTouchTarget: "indicator-touch-target",
} as const;

export interface AngioDetectConsumableProps {
  className?: string;
  "data-testid"?: string;

  positive?: boolean;
  onIndicatorClick?: () => void;
}

export function AngioDetectConsumable(props: AngioDetectConsumableProps) {
  const domId = useDomId();
  const classes = classnames("angio-detect-consumable", props.className);

  return (
    <svg
      className={classes}
      data-testid={props["data-testid"]}
      viewBox="0 0 250 413"
      width="250"
      height="413"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g filter={`url(#${domId("Angio-detect-consumable_svg__a")})`}>
        <rect
          width={242.783}
          height={406}
          x={4}
          fill={`url(#${domId("Angio-detect-consumable_svg__b")})`}
          rx={48.142}
        />
      </g>
      <g filter={`url(#${domId("Angio-detect-consumable_svg__c")})`}>
        <rect
          width={223.654}
          height={386.743}
          x={12.828}
          y={11.233}
          fill={`url(#${domId("Angio-detect-consumable_svg__d")})`}
          rx={41.723}
        />
        <rect
          width={222.05}
          height={385.138}
          x={13.631}
          y={12.036}
          stroke="#D1D7DE"
          strokeWidth={1.605}
          rx={40.921}
        />
      </g>
      <g filter={`url(#${domId("Angio-detect-consumable_svg__e")})`}>
        <rect width={52} height={137} x={139} y={109} fill="#F1F1F1" rx={26} />
      </g>
      <rect
        width={51}
        height={136}
        x={139.5}
        y={109.5}
        stroke="#A3A19D"
        strokeOpacity={0.3}
        rx={25.5}
      />
      <g filter={`url(#${domId("Angio-detect-consumable_svg__f")})`}>
        <rect
          width={62}
          height={148}
          x={134.5}
          y={103.5}
          stroke={`url(#${domId("Angio-detect-consumable_svg__g")})`}
          strokeWidth={11}
          rx={31}
        />
      </g>
      <g filter={`url(#${domId("Angio-detect-consumable_svg__h")})`}>
        <rect width={39} height={39} x={147} y={293} fill="#F1F1F1" rx={19.5} />
      </g>
      <rect
        width={38}
        height={38}
        x={147.5}
        y={293.5}
        stroke="#A3A19D"
        strokeOpacity={0.3}
        rx={19}
      />
      <g filter={`url(#${domId("Angio-detect-consumable_svg__i")})`}>
        <rect
          width={53}
          height={53}
          x={140}
          y={287}
          stroke={`url(#${domId("Angio-detect-consumable_svg__j")})`}
          strokeWidth={14}
          rx={26.5}
        />
      </g>
      <path fill="#C67E6F" fillOpacity={0.5} d="M142 142h46.842v17.175H142z" />
      <path
        stroke={"#000000"}
        strokeOpacity={props.positive ? "0" : "1"}
        fill={"#BF3939"}
        fillOpacity={props.positive ? "1" : "0"}
        strokeDasharray="6 10 15 10 10 9 10 10 15 10 10 9"
        d="M142 201h47v17h-47z"
      />
      <path
        fill="#000"
        fillOpacity={0.3}
        d="M201.937 55.898c.382 0 .796-.096 1.24-.287v2.133c-.444.307-1.111.461-1.999.461-.991 0-1.726-.294-2.205-.882-.478-.595-.718-1.483-.718-2.666v-5.916h-1.107v-1.22l1.425-.985.698-2.42h1.743v2.461h2.071v2.164h-2.071v6.008c0 .766.307 1.149.923 1.149ZM193.949 58.205c-1.361 0-2.396-.496-3.107-1.487-.711-.991-1.067-2.448-1.067-4.368 0-2.01.335-3.51 1.005-4.502.677-.991 1.72-1.487 3.128-1.487.424 0 .868.062 1.333.185.465.123.882.3 1.251.533l-.78 2.123c-.567-.335-1.069-.503-1.507-.503-.581 0-1.001.304-1.261.913-.253.601-.38 1.507-.38 2.717 0 1.183.127 2.068.38 2.656.253.58.666.871 1.241.871.683 0 1.398-.239 2.143-.717v2.4a4.432 4.432 0 0 1-2.379.666ZM184.73 58.205c-1.428 0-2.556-.506-3.383-1.518-.821-1.018-1.231-2.457-1.231-4.317 0-1.887.373-3.36 1.118-4.42.745-1.059 1.784-1.589 3.117-1.589 1.244 0 2.225.455 2.943 1.364.718.902 1.077 2.17 1.077 3.804v1.456h-5.486c.02 1.019.229 1.778.625 2.277.397.492.944.738 1.641.738.889 0 1.798-.277 2.727-.83v2.245c-.875.526-1.924.79-3.148.79Zm-.399-9.742c-.39 0-.711.209-.964.626-.253.41-.4 1.05-.441 1.917h2.768c-.013-.834-.14-1.466-.379-1.897-.239-.43-.567-.646-.984-.646ZM177.676 55.898c.383 0 .796-.096 1.241-.287v2.133c-.445.307-1.111.461-2 .461-.991 0-1.726-.294-2.205-.882-.478-.595-.717-1.483-.717-2.666v-5.916h-1.108v-1.22l1.425-.985.698-2.42h1.743v2.461h2.071v2.164h-2.071v6.008c0 .766.308 1.149.923 1.149ZM168.263 58.205c-1.429 0-2.557-.506-3.384-1.518-.82-1.018-1.231-2.457-1.231-4.317 0-1.887.373-3.36 1.118-4.42.745-1.059 1.784-1.589 3.117-1.589 1.244 0 2.225.455 2.943 1.364.718.902 1.077 2.17 1.077 3.804v1.456h-5.486c.021 1.019.229 1.778.625 2.277.397.492.944.738 1.641.738.889 0 1.798-.277 2.728-.83v2.245c-.875.526-1.925.79-3.148.79Zm-.4-9.742c-.39 0-.711.209-.964.626-.253.41-.4 1.05-.441 1.917h2.769c-.014-.834-.141-1.466-.38-1.897-.239-.43-.567-.646-.984-.646ZM162.018 50.36c0 2.475-.506 4.369-1.518 5.681-1.004 1.306-2.454 1.959-4.347 1.959h-3.671V43.009h4.009c1.743 0 3.1.646 4.071 1.938.971 1.285 1.456 3.09 1.456 5.414Zm-2.861.083c0-3.35-.923-5.024-2.768-5.024h-1.118v10.14h.902c1.019 0 1.771-.423 2.256-1.27.486-.855.728-2.137.728-3.846ZM145.212 52.268c0 1.873-.397 3.332-1.19 4.378-.793 1.04-1.879 1.559-3.26 1.559-.875 0-1.648-.24-2.318-.718-.67-.479-1.186-1.166-1.548-2.061-.362-.903-.543-1.955-.543-3.158 0-1.853.393-3.299 1.179-4.338.786-1.046 1.876-1.569 3.271-1.569 1.346 0 2.416.534 3.209 1.6.8 1.06 1.2 2.495 1.2 4.307Zm-6.07 0c0 1.189.129 2.088.389 2.696.26.609.677.913 1.251.913 1.094 0 1.641-1.203 1.641-3.61 0-1.196-.133-2.088-.4-2.676-.26-.594-.673-.892-1.241-.892-.574 0-.991.298-1.251.892-.26.588-.389 1.48-.389 2.677ZM134.415 58h-2.728V46.577h2.728V58Zm-2.841-14.407c0-.45.13-.806.39-1.066.266-.267.636-.4 1.107-.4.445 0 .8.133 1.067.4.266.26.4.615.4 1.066 0 .465-.137.827-.411 1.087-.273.253-.625.38-1.056.38-.451 0-.813-.127-1.087-.38-.273-.26-.41-.622-.41-1.087ZM130.292 46.597v1.6l-1.363.307c.266.479.4 1.08.4 1.805 0 1.21-.329 2.157-.985 2.84-.656.684-1.572 1.026-2.748 1.026-.342 0-.595-.027-.759-.082a3.407 3.407 0 0 0-.369.39.821.821 0 0 0-.174.533c0 .478.414.717 1.241.717h1.651c.97 0 1.715.264 2.235.79.526.52.789 1.306.789 2.358 0 1.327-.444 2.352-1.333 3.077-.888.724-2.167 1.086-3.835 1.086-1.264 0-2.238-.276-2.922-.83-.683-.547-1.025-1.33-1.025-2.348 0-.636.195-1.197.584-1.682.39-.478.93-.827 1.62-1.046a2.01 2.01 0 0 1-.861-.636 1.61 1.61 0 0 1-.328-1.004 1.8 1.8 0 0 1 .102-.626c.069-.191.164-.37.288-.533.129-.171.389-.42.779-.749-.472-.287-.844-.728-1.118-1.322a4.688 4.688 0 0 1-.41-1.98c0-1.25.328-2.218.984-2.901.657-.684 1.597-1.026 2.82-1.026.233 0 .499.028.8.082.301.048.53.1.687.154h3.25Zm-6.716 13.064c0 .45.14.796.421 1.035.287.246.693.37 1.22.37.827 0 1.446-.158 1.856-.472.417-.315.625-.745.625-1.292 0-.43-.113-.735-.338-.913-.219-.178-.632-.266-1.241-.266h-1.323a1.1 1.1 0 0 0-.892.41c-.218.28-.328.656-.328 1.128Zm.841-9.352c0 1.347.379 2.02 1.138 2.02.738 0 1.108-.68 1.108-2.04 0-1.395-.37-2.092-1.108-2.092-.759 0-1.138.704-1.138 2.112ZM117.116 58v-6.81c0-.826-.099-1.452-.297-1.875-.198-.424-.52-.636-.964-.636-.588 0-1.019.294-1.292.881-.273.582-.41 1.566-.41 2.954v5.485h-2.728V46.578h2.164l.328 1.466h.174a2.864 2.864 0 0 1 1.056-1.23c.458-.301.995-.452 1.61-.452 1.039 0 1.815.356 2.328 1.067.519.71.779 1.75.779 3.117v7.454h-2.748ZM107.467 58l-.861-3.784h-3.907L101.838 58h-2.79l3.713-15.053h3.783L110.267 58h-2.8Zm-1.384-6.255-.8-3.486a99.432 99.432 0 0 1-.328-1.59 30.32 30.32 0 0 1-.297-1.712 49.664 49.664 0 0 1-.339 1.948c-.136.704-.492 2.318-1.066 4.84h2.83ZM93.85 58h-2.902l-2.143-5.373L86.815 58h-2.9l3.424-7.793-3.169-7.198h2.81l1.979 4.932 1.712-4.932h2.923l-3.169 7.321L93.85 58ZM83.904 58h-2.902l-2.143-5.373L76.869 58h-2.901l3.425-7.793-3.169-7.198h2.81l1.979 4.932 1.712-4.932h2.922L80.48 50.33 83.904 58ZM73.106 58H66.35V43.009h6.757v2.41h-3.968v3.568h3.681v2.42h-3.68v4.153h3.967V58ZM64.155 50.36c0 2.475-.506 4.369-1.518 5.681C61.632 57.347 60.183 58 58.29 58h-3.671V43.009h4.009c1.743 0 3.1.646 4.07 1.938.971 1.285 1.457 3.09 1.457 5.414Zm-2.861.083c0-3.35-.923-5.024-2.769-5.024h-1.117v10.14h.902c1.019 0 1.77-.423 2.256-1.27.485-.855.728-2.137.728-3.846ZM48.825 58V43.009h2.625V58h-2.625Z"
      />
      <ellipse
        className="positive-indicator"
        data-testid={TestId.IndicatorTouchTarget}
        onClick={props.onIndicatorClick}
        cx="165.5"
        cy="209.5"
        rx={45}
        ry={28}
        fill="violet"
        fillOpacity={0}
      />
      <defs>
        <filter
          id={domId("Angio-detect-consumable_svg__a")}
          width={249.202}
          height={412.419}
          x={0.791}
          y={0}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={3.209} />
          <feGaussianBlur stdDeviation={1.605} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_272_30825"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_272_30825"
            result="shape"
          />
        </filter>
        <filter
          id={domId("Angio-detect-consumable_svg__c")}
          width={231.654}
          height={394.743}
          x={8.828}
          y={8.233}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_272_30825"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_272_30825"
            result="shape"
          />
        </filter>
        <filter
          id={domId("Angio-detect-consumable_svg__e")}
          width={52}
          height={141}
          x={139}
          y={109}
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
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow_272_30825" />
        </filter>
        <filter
          id={domId("Angio-detect-consumable_svg__f")}
          width={81}
          height={167}
          x={125}
          y={94}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={2} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_272_30825"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_272_30825"
            result="shape"
          />
        </filter>
        <filter
          id={domId("Angio-detect-consumable_svg__h")}
          width={39}
          height={43}
          x={147}
          y={293}
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
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow_272_30825" />
        </filter>
        <filter
          id={domId("Angio-detect-consumable_svg__i")}
          width={75}
          height={75}
          x={129}
          y={276}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={2} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_272_30825"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_272_30825"
            result="shape"
          />
        </filter>
        <linearGradient
          id={domId("Angio-detect-consumable_svg__b")}
          x1={192.34}
          x2={66.179}
          y1={401.186}
          y2={-30.629}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C4C3C3" />
          <stop offset={1} stopColor="#F4F3F3" />
        </linearGradient>
        <linearGradient
          id={domId("Angio-detect-consumable_svg__d")}
          x1={45.261}
          x2={190.717}
          y1={-10}
          y2={381.284}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8E9EA" />
          <stop offset={1} stopColor="#F3F3F3" />
        </linearGradient>
        <linearGradient
          id={domId("Angio-detect-consumable_svg__g")}
          x1={117.426}
          x2={245.959}
          y1={259}
          y2={121.449}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset={1} stopColor="#C1C1C1" />
        </linearGradient>
        <linearGradient
          id={domId("Angio-detect-consumable_svg__j")}
          x1={116.541}
          x2={147.472}
          y1={345.029}
          y2={256.111}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset={1} stopColor="#C1C1C1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
