import React, { useState, createContext } from 'react';

const defaultVal = {};

const CustomTheme = createContext<object>(defaultVal);

export default CustomTheme;
