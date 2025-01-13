export interface EventXml {
    string: EventXmlProperty[];
}

export interface EventXmlProperty {
    '@_key': string;
    '@_value': string;
}

export class Event {
    constructor(private readonly eventXml: EventXml) {}

    static fromXml(eventXml: EventXml): Event {
        return new Event(eventXml);
    }

    toString(): string {
        return this.eventXml.string
            .find((property) => property['@_key'] === 'concept:name')!
            ['@_value'].replaceAll(' ', '_');
    }
}
