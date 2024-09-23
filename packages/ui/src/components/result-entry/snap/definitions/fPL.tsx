import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPRowSelectionDeviceDefinition,
} from "./definition-constants";

export const fPLDefinition: SNAPRowSelectionDeviceDefinition = {
  type: SNAPResultEntryType.RowSelection,
  ivlsAssay: "fPL",
  example: {
    instructions: "resultsEntry.snap.labels.selectWithWarning",
    dots: [
      {
        dotId: "reference",
        position: "TwoDot_TopLeft",
        filledColor: "black",
        label: "resultsEntry.snap.labels.reference",
        control: true,
        labelStyles: {
          fontSize: "10px",
        },
      },
      {
        dotId: "sample",
        position: "TwoDot_TopRight",
        filledColor: "black",
        label: "resultsEntry.snap.labels.sample",
        control: true,
        labelStyles: {
          fontSize: "10px",
        },
      },
    ],
  },
  rows: [
    {
      rowId: SnapResultTypeEnum.FELINE_FPL_NORMAL,
      result: SnapResultTypeEnum.FELINE_FPL_NORMAL,
      ivlsResult: "Normal",
      abnormal: false,
      resultLabel: "resultsEntry.snap.results.normal",
      resultDescription: "resultsEntry.snap.labels.normalDefinition",
      referenceImages: [
        {
          dots: [
            {
              dotId: "reference",
              position: "TwoDot_TopLeft",
              filledColor: "#7CACB8FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "TwoDot_TopRight",
              filledColor: "#B9CAD0FF",
              control: true,
            },
          ],
        },
        {
          dots: [
            {
              dotId: "reference",
              position: "TwoDot_TopLeft",
              filledColor: "#7CACB8FF",
              control: true,
            },
          ],
        },
      ],
    },
    {
      rowId: SnapResultTypeEnum.FELINE_FPL_ABNORMAL,
      result: SnapResultTypeEnum.FELINE_FPL_ABNORMAL,
      ivlsResult: "Abnormal",
      abnormal: true,
      resultLabel: "resultsEntry.snap.results.abnormal",
      resultDescription: "resultsEntry.snap.labels.abnormalDefinition",
      referenceImages: [
        {
          dots: [
            {
              dotId: "reference",
              position: "TwoDot_TopLeft",
              filledColor: "#7CACB8FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "TwoDot_TopRight",
              filledColor: "#7CACB8FF",
              control: true,
            },
          ],
        },
        {
          dots: [
            {
              dotId: "reference",
              position: "TwoDot_TopLeft",
              filledColor: "#7CACB8FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "TwoDot_TopRight",
              filledColor: "#4A8D9DFF",
              control: true,
            },
          ],
        },
      ],
    },
  ],
};
