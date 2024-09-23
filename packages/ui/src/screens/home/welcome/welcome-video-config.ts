import VideoPartOne from "../../../assets/home/welcome/welcome_part1.webm";
import VideoPartTwo from "../../../assets/home/welcome/welcome_part2.webm";
import VideoPartThree from "../../../assets/home/welcome/welcome_part3.webm";
import CaptionPartOne from "../../../assets/home/welcome/welcome_part1.vtt";
import CaptionPartTwo from "../../../assets/home/welcome/welcome_part2.vtt";
import CaptionPartThree from "../../../assets/home/welcome/welcome_part3.vtt";

export const VIDEO_ORDER = [VideoPartOne, VideoPartTwo, VideoPartThree];
export const CAPTION_ORDER = [CaptionPartOne, CaptionPartTwo, CaptionPartThree];

export interface CueConfiguration {
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const CueConfigurations: Record<string, CueConfiguration> = {
  // Video 1
  welcome: {
    position: {
      top: "40%",
      bottom: "40%",
      left: "23%",
      right: "23%",
    },
  },
  analyzer_icons: {
    position: {
      top: "25%",
      left: "10%",
      right: "10%",
    },
  },
  home_button: {
    position: {
      top: "10%",
      left: "5%",
      right: "40%",
    },
  },
  // Video 2
  gear_icon: {
    position: {
      top: "3%",
      left: "25%",
      right: "25%",
    },
  },
  gear_icon_list: {
    position: {
      top: "10%",
      left: "20%",
      right: "30%",
    },
  },
  pending_list: {
    position: {
      top: "50%",
      left: "35%",
      right: "10%",
    },
  },
  search_pending_list: {
    position: {
      top: "36%",
      left: "8%",
      right: "50%",
    },
  },
  analyze_sample: {
    position: {
      top: "36%",
      left: "8%",
      right: "50%",
    },
  },
  // Video 3
  patient_info: {
    position: {
      top: "36%",
      left: "31%",
      right: "30%",
    },
  },
  tap_run: {
    position: {
      top: "6%",
      right: "13%",
    },
  },
  results_column: {
    position: {
      top: "30%",
      right: "36%",
      left: "20%",
    },
  },
  new_results_popup: {
    position: {
      bottom: "11%",
      left: "5%",
      right: "55%",
    },
  },
  tap_new_results_popup: {
    position: {
      bottom: "11%",
      left: "5%",
      right: "55%",
    },
  },
  results_patient_signalment: {
    position: {
      top: "20%",
      left: "23%",
      right: "23%",
    },
  },
  service_category_icons: {
    position: {
      top: "0%",
      left: "20%",
      right: "20%",
    },
  },
  historical_results: {
    position: {
      top: "25%",
      left: "7%",
      right: "40%",
    },
  },
  differentials: {
    position: {
      bottom: "45%",
      left: "15%",
      right: "15%",
    },
  },

  add_test: {
    position: {
      top: "6%",
      left: "40%",
      right: "15%",
    },
  },

  print: {
    position: {
      top: "20%",
      left: "35%",
      right: "27%",
    },
  },

  return_home: {
    position: {
      top: "1%",
      left: "15%",
      right: "45%",
    },
  },

  creating_clarity: {
    position: {
      top: "65%",
      left: "23%",
      right: "23%",
    },
  },
};

const DEFAULT_POSITION = {
  bottom: "30px",
  left: "23%",
  right: "23%",
};

export function getCueConfiguration(id?: string) {
  return (
    CueConfigurations[id as string] ?? { position: { ...DEFAULT_POSITION } }
  );
}
