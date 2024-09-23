import { SnapResultTypeEnum } from "@viewpoint/api";
import {
  SNAPResultEntryType,
  SNAPRowSelectionDeviceDefinition,
} from "./definition-constants";

export const LeishmaniaDefinition: SNAPRowSelectionDeviceDefinition = {
  type: SNAPResultEntryType.RowSelection,
  ivlsAssay: "CanL",
  example: {
    instructions: "resultsEntry.snap.labels.select",
    dots: [
      {
        dotId: "posControl",
        position: "TopCenter",
        filledColor: "black",
        label: "resultsEntry.snap.labels.positiveControl",
        labelPosition: "right",
        control: true,
        labelStyles: {
          fontSize: "10px",
        },
      },
      {
        dotId: "negControl",
        position: "MiddleLeft",
        filledColor: "black",
        label: "resultsEntry.snap.labels.negativeControl",
        control: true,
        labelStyles: {
          fontSize: "10px",
        },
      },
      {
        dotId: "sample",
        position: "MiddleRight",
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
      rowId: SnapResultTypeEnum.CANINE_LEISHMANIA_NEGATIVE,
      result: SnapResultTypeEnum.CANINE_LEISHMANIA_NEGATIVE,
      ivlsResult: "Negative",
      abnormal: false,
      resultLabel: "resultsEntry.snap.results.negative",
      resultDescription: "resultsEntry.snap.labels.negativeDefinition",
      referenceImages: [
        {
          dots: [
            {
              dotId: "reference",
              position: "TopCenter",
              filledColor: "#416E90FF",
              control: true,
            },
          ],
        },
      ],
    },
    {
      rowId: SnapResultTypeEnum.CANINE_LEISHMANIA_POSITIVE,
      result: SnapResultTypeEnum.CANINE_LEISHMANIA_POSITIVE,
      ivlsResult: "Positive",
      abnormal: true,
      resultLabel: "resultsEntry.snap.results.positive",
      resultDescription: "resultsEntry.snap.labels.positiveDefinition",
      referenceImages: [
        {
          dots: [
            {
              dotId: "posControl",
              position: "TopCenter",
              filledColor: "#416E90FF",
              control: true,
            },
            {
              dotId: "sample",
              position: "MiddleRight",
              filledColor: "#416E90FF",
              control: true,
            },
          ],
        },
        {
          dots: [
            {
              dotId: "posControl",
              position: "TopCenter",
              filledColor: "#416E90FF",
              control: true,
            },
            {
              dotId: "negControl",
              position: "MiddleLeft",
              filledColor: "#A1B3CAFF",
              control: true,
            },
            {
              dotId: "sample",
              position: "MiddleRight",
              filledColor: "#416E90FF",
              control: true,
            },
          ],
        },
      ],
    },
  ],
};
