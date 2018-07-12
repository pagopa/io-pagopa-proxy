/**
 * Utility used to generate YAML from WSDL
 */

const apiconnWsdl = require("apiconnect-wsdl");
const fs = require("fs");
const yaml = require("js-yaml");

startYamlGenerator().catch(error => {
  console.error(`Error occurred generating YAML files: ${error}`);
});

// Generate every YAML files using WSDL files
async function startYamlGenerator() {
  console.info("YAML Generator STARTED!");
  await generateYamlFilesForWsdl(`${__dirname}/../src/wsdl/CdPerNodo.wsdl`);
  await generateYamlFilesForWsdl(`${__dirname}/../src/wsdl/NodoPerPsp.wsdl`);
  console.info("YAML Generator COMPLETED!");
}

// Generate YAML files using a specific WSDL file
async function generateYamlFilesForWsdl(wsdlPath) {
  console.info(`Generating YAML definition for ${wsdlPath}...`);
  const wsdls = await apiconnWsdl.getJsonForWSDL(wsdlPath);

  // Get Services from all parsed WSDLs
  const serviceData = apiconnWsdl.getWSDLServices(wsdls);

  // Loop through all services and genereate yaml file
  for (const item in serviceData.services) {
    if (!serviceData.services.hasOwnProperty(item)) {
      continue;
    }
    const serviceName = serviceData.services[item].service;
    const wsdlId = serviceData.services[item].filename;
    const wsdlEntry = apiconnWsdl.findWSDLForServiceName(wsdls, serviceName);
    const swagger = apiconnWsdl.getSwaggerForService(
      wsdlEntry,
      serviceName,
      wsdlId
    );
    fs.writeFileSync(`./pagopa_api/yaml-file/${serviceName}.yaml`, yaml.safeDump(swagger));
  }
}
