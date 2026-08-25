import React from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme, Colors } from '../../../theme';
import { SW, SH, SF } from '../../../utils/dimensions';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  searchIconColor?: string;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
  searchIconColor,
  loading = false,
  containerStyle,
  inputStyle,
  autoFocus = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Search 
        color={searchIconColor || theme.colors.textSecondary} 
        size={SW(16)} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={[styles.searchInput, { fontFamily: theme.fontfamily.regular }, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary || Colors.tabInactive}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
      {loading && (
        <ActivityIndicator 
          color={theme.colors.customButtonGreen} 
          style={styles.loadingIndicator} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray_200,
    borderRadius: SW(10),
    height: SH(46),
    paddingHorizontal: SW(12),
  },
  searchIcon: {
    marginRight: SW(8),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: SF(13.5),
    color: Colors.black,
    padding: 0,
    includeFontPadding: false,
  },
  loadingIndicator: {
    marginLeft: SW(10),
  },
});

export default SearchBar;
