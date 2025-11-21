import { DrawerHeaderProps } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { FC } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

const AppHeader: FC<DrawerHeaderProps> = ({ route, navigation, options }: DrawerHeaderProps) => {
  const handleToggleDrawer = () => {
    navigation.toggleDrawer(); // Use the navigation prop to open/close the drawer
  };

  const handleGoBack = () => {
    navigation.goBack(); // Use the back prop to show/hide a back button
  };

  return (
    <View>
        <View>
            <Text>handleToggleDrawer</Text>
        </View>
        <TouchableOpacity onPress={handleToggleDrawer}/>
    </View>
  );
};

export default function RootLayout() {

  return (
    <Drawer screenOptions={{drawerPosition: 'right', header: ((props) => <AppHeader {...props} />),  }}>
        {/* <Drawer.Screen name='(tabs)' options={{headerShown: false, title: 'Home'}}/> */}
    </Drawer>
  );
}
