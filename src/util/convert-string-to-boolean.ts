function stringToBoolean(str: string ): boolean | undefined {
  try {
    return JSON.parse(str.toLowerCase());
  } catch (e) {
    return undefined;
  }
}

export default stringToBoolean;
