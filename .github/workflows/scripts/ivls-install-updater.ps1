   # Hardcoded paths for the XML files and the executable
  $newManifestPath = "C:\tools\updater\manifest.xml"
  $currentManifestPath = "C:\IDEXX\LabStation\manifest.xml"
  $executablePath = "C:\tools\updater\IVLSInstall.exe"

  # Function to read and return the content of an XML file
  function Get-XmlContent ($filePath) {
    try {
      [xml]$xmlContent = Get-Content $filePath -ErrorAction 'SilentlyContinue'
      return $xmlContent
    } catch {
      Write-Error "Error reading XML file at $filePath"
    }
  }

  # Download the new manifest
  Read-S3Object -BucketName ivls-automation -Key IVLSInstallation/manifest.xml -File $newManifestPath

  # Read the content of the two XML files
  $newManifest = Get-XmlContent -filePath $newManifestPath
  $currentManifest = Get-XmlContent -filePath $currentManifestPath


  # Compare the contents of the two XML files
 if ($null -eq $currentManifest -or !($newManifest.OuterXml -eq $currentManifest.OuterXml)) {
    # The XML files are different, launch the executable
    Write-Host "Current IVLS version is different from the available nightly build -- installing the nightly build."
    Read-S3Object -BucketName ivls-automation -Key IVLSInstallation/IVLSInstall.exe -File $executablePath
    Start-Process -FilePath $executablePath -Verb RunAs -ArgumentList "/passive /norestart" -PassThru | Wait-Process

  } else {
    # The XML files are the same, do nothing
    Write-Host "The XML files are identical. No action taken."
  }
