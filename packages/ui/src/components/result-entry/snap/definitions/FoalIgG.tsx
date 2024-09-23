import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPRowSelectionDeviceDefinition,
} from "./definition-constants";

export const FoalIgGDefinition: SNAPRowSelectionDeviceDefinition = {
  type: SNAPResultEntryType.RowSelection,
  ivlsAssay: "IgG",
  example: {
    instructions: "resultsEntry.snap.labels.select",
    dots: [
      {
        dotId: "400",
        position: "ThreeDot_TopLeft",
        filledColor: "black",
        label: "resultsEntry.snap.labels.400Spot",
        control: true,
        labelStyles: {
          fontSize: "10px",
          fontWeight: "unset",
        },
      },
      {
        dotId: "800",
        position: "ThreeDot_TopRight",
        filledColor: "black",
        label: "resultsEntry.snap.labels.800Spot",
        control: true,
        labelStyles: {
          fontSize: "10px",
          fontWeight: "unset",
        },
      },
      {
        dotId: "sample",
        position: "ThreeDot_MiddleCenter",
        filledColor: "black",
        label: "resultsEntry.snap.labels.sample",
        control: true,
        labelStyles: {
          fontSize: "10px",
          fontWeight: "unset",
        },
      },
    ],
  },
  rows: [
    {
      rowId: SnapResultTypeEnum.EQUINE_FOAL_IGG_400_POSITIVE,
      result: SnapResultTypeEnum.EQUINE_FOAL_IGG_400_POSITIVE,
      ivlsResult: "LT400",
      resultLabel: "resultsEntry.snap.results.lt_400",
      resultDescription: "resultsEntry.snap.labels.lt_400",
      abnormal: true,
      referenceImages: [
        {
          dots: [
            {
              dotId: "400",
              position: "ThreeDot_TopLeft",
              filledColor: "#8BAAC7FF",
              control: true,
            },
            {
              dotId: "800",
              position: "ThreeDot_TopRight",
              filledColor: "#306F93FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "ThreeDot_MiddleCenter",
              filledColor: "#D5DFE9FF",
              control: true,
            },
          ],
        },
      ],
    },
    {
      rowId: SnapResultTypeEnum.EQUINE_FOAL_IGG_400_800_POSITIVE,
      result: SnapResultTypeEnum.EQUINE_FOAL_IGG_400_800_POSITIVE,
      ivlsResult: "400THRU800",
      resultLabel: "resultsEntry.snap.results.400-800",
      resultDescription: "resultsEntry.snap.labels.400-800",
      abnormal: true,
      referenceImages: [
        {
          dots: [
            {
              dotId: "400",
              position: "ThreeDot_TopLeft",
              filledColor: "#D5DFE9FF",
              control: true,
            },
            {
              dotId: "800",
              position: "ThreeDot_TopRight",
              filledColor: "#306F93FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "ThreeDot_MiddleCenter",
              filledColor: "#8BAAC7FF",
              control: true,
            },
          ],
        },
      ],
    },
    {
      rowId: SnapResultTypeEnum.EQUINE_FOAL_IGG_800_POSITIVE,
      result: SnapResultTypeEnum.EQUINE_FOAL_IGG_800_POSITIVE,
      ivlsResult: "GT800",
      resultLabel: "resultsEntry.snap.results.gt_800",
      resultDescription: "resultsEntry.snap.labels.gt_800",
      abnormal: false,
      referenceImages: [
        {
          dots: [
            {
              dotId: "400",
              position: "ThreeDot_TopLeft",
              filledColor: "#D5DFE9FF",
              control: true,
            },
            {
              dotId: "800",
              position: "ThreeDot_TopRight",
              filledColor: "#8BAAC7FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "ThreeDot_MiddleCenter",
              filledColor: "#306F93FF",
              control: true,
            },
          ],
        },
      ],
    },
  ],
};
