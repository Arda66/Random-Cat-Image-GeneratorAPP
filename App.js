import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import api_key from './components/API_KEY';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CameraRoll from '@react-native-community/cameraroll';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const [randomCatURL, setrandomCatURL] = useState();
  const [isSaved, setIsSaved] = useState(false);
  var svg;
  useEffect(() => {
    GetrandomCat();
    setIsSaved(false);
  }, []);

  const ShareCat = async () => {
    const path = `${RNFS.DocumentDirectoryPath}/cat.jpg`;
    await RNFS.downloadFile({fromUrl: randomCatURL, toFile: `file://${path}`})
      .promise.then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
    RNFS.readFile(`file://${path}`, 'base64').then(res => {
      let shareOptionsUrl = {
        url: `data:image/jpeg;base64,${res}`,
      };
      Share.open(shareOptionsUrl).catch(err => {
        err && ToastAndroid.show('Share cancelled!', ToastAndroid.SHORT);
      });
    });
  };

  const SaveImageToGallery = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    if (svg && !isSaved) {
      setIsSaved(true);
      RNFetchBlob.config({
        fileCache: true,
        appendExt: 'png',
        path: `${RNFS.ExternalDirectoryPath}/cat.png`,
      })
        .fetch('GET', randomCatURL)
        .then(res => {
          CameraRoll.save(res.data, {type: 'photo', album: 'SavedCats'})
            .then(() => {
              ToastAndroid.show('Image saved!', ToastAndroid.SHORT);
            })
            .catch(() => {
              ToastAndroid.show('Image not saved!', ToastAndroid.SHORT);
            });
        });
    } else {
      ToastAndroid.show('Image saved already', ToastAndroid.SHORT);
    }
  };

  const hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };
  const GetrandomCat = () => {
    setIsSaved(false);
    axios
      .get(' https://api.thecatapi.com/v1/images/search', {
        headers: {
          'x-api-key': api_key,
        },
      })
      .then(response => {
        setrandomCatURL(response.data[0].url);
      });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.Title}>Random Cat Generator</Text>
      <TouchableOpacity
        onPress={() => {
          GetrandomCat();
        }}
        style={styles.Button}>
        <Text style={styles.ButtonText}>Generate</Text>
      </TouchableOpacity>
      <Image
        source={{uri: randomCatURL}}
        style={{alignSelf: 'center', width: '95%', height: '60%'}}
        ref={ref => (svg = ref)}
      />
      <View style={styles.bottomButtonWrapper}>
        <TouchableOpacity
          style={[styles.Button, {backgroundColor: 'green'}]}
          onPress={() => {
            ShareCat();
          }}>
          <Text style={styles.ButtonText}>Share</Text>
          <FontAwesomeIcon name="share" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.Button, {backgroundColor: 'red'}]}
          onPress={() => {
            SaveImageToGallery();
          }}>
          <Text style={styles.ButtonText}>Save</Text>
          <FontAwesomeIcon name="save" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  Title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: 'blue',
  },
  Button: {
    height: 75,
    width: 120,
    borderRadius: 15,
    backgroundColor: '#afd1fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 25,
    elevation: 3,
    alignSelf: 'center',
  },
  ButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  bottomButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default App;
