import { ApacheGanttTimelineChartPreviewProps } from "../typings/ApacheGanttTimelineChartProps";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[]; // used for customizing object grids
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[]; // used for customizing object grids
};

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number; // optionally sets a growth factor if used in a layout (default = 1)
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[]; // any other preview element
    borders?: boolean; // sets borders around the layout to visually group its children
    borderRadius?: number; // integer. Can be used to create rounded borders
    backgroundColor?: string; // HTML color, formatted #RRGGBB
    borderWidth?: number; // sets the border width
    padding?: number; // integer. adds padding around the container
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow"; // default is fixed
};

type TextProps = BaseProps & {
    type: "Text";
    content: string; // text that should be shown
    fontSize?: number; // sets the font size
    fontColor?: string; // HTML color, formatted #RRGGBB
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object; // widgets property object from Values API
    placeholder: string; // text to be shown inside the dropzone when empty
    showDataSourceHeader?: boolean; // true by default. Toggles whether to show a header containing information about the datasource
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object; // object property instance from the Value API
    child: PreviewProps; // any type of preview property to visualize the object instance
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: PreviewProps; // any type of preview property component (optional)
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(
    _values: ApacheGanttTimelineChartPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    // Validate and conditionally show/hide properties based on configuration
    // This can be used to provide a better Studio Pro experience

    // Example: hide colorAttribute if not needed
    if (defaultProperties && defaultProperties[1]?.properties) {
        // Properties under the "Data" group (index 1) are conditional
        // You can hide/show properties based on user selections
    }

    return defaultProperties;
}

export function check(_values: ApacheGanttTimelineChartPreviewProps): Problem[] {
    const errors: Problem[] = [];

    // Validate required properties
    if (!_values.itemsDatasource) {
        errors.push({
            property: "itemsDatasource",
            severity: "error",
            message: "Items datasource is required. Please select a datasource."
        });
    }

    if (!_values.itemUuidAttribute) {
        errors.push({
            property: "itemUuidAttribute",
            severity: "error",
            message: "Item UUID attribute is required. This uniquely identifies each item."
        });
    }

    if (!_values.startDatetimeAttribute) {
        errors.push({
            property: "startDatetimeAttribute",
            severity: "error",
            message: "Start datetime attribute is required. This defines when events start."
        });
    }

    if (!_values.endDatetimeAttribute) {
        errors.push({
            property: "endDatetimeAttribute",
            severity: "error",
            message: "End datetime attribute is required. This defines when events end."
        });
    }

    // Optional: warn if color attribute is not set
    if (!_values.colorAttribute) {
        errors.push({
            property: "colorAttribute",
            severity: "warning",
            message: "Color attribute not set. Events will use a default blue color."
        });
    }

    return errors;
}

// export function getPreview(values: ApacheGanttTimelineChartPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     }
// }

// export function getCustomCaption(values: ApacheGanttTimelineChartPreviewProps, platform: Platform): string {
//     return "ApacheGanttTimelineChart";
// }
