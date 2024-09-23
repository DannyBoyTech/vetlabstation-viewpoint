# Differentials Import

The differentials feature (a.k.a. interpretive summaries) exposes DxD-sourced data via the 'little book' icon on results pages. The value of the feature is to provide medical context for the result.

This process needs two things:

    1. a DxD export zip file that contains GL_Services.csv and GL_InterpretiveSummaries.csv as input
    2. a filesystem path to an output directory to update

The process generates:

    <outputDir>/packages/ui/public/locales/<locale>/differentials.json (for each available locale)
    <outputDir>/packages/ui/public/differentials/<hash>.<ext> (for each embedded image)

If `<outputDir>` is selected to be the root of the viewpoint repository, files will be overwritten and land in exactly the correct place to be used by client.

## Running the import

To run the import:

```bash
    $ cd <viewpointRepo>/packages/differentials
    $ npm run build
    $ npm run differentials -- <dxdZipFsPath> <viewPointRepo>
```
