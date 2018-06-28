/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import RNFS from 'react-native-fs';
import uuid from './uuid';
import React, { Component } from 'react';
import { Slider, Platform, StyleSheet, NativeModules, NativeEventEmitter, TouchableHighlight, Text, View } from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu'
});

type Props = {};
const AudioEngine = NativeModules.AudioEngine;

const AudioEventEmitter = new NativeEventEmitter(AudioEngine);

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      filename: uuid() + '.wav',
      recording: false,
      currentTime: 0.0,
      currentState: 'STATE_INIT'
    };
    AudioEngine.setInputGain(3);

    const AudioEventEmitter = new NativeEventEmitter(AudioEngine);
    positionChange = AudioEventEmitter.addListener('audioPositionChanged', ev => {
      console.log('ios audioPositionChanged: ' + ev.position + ' Duration: ' + ev.duration);
      this.updatePosition(ev.position, ev.duration);
    });
    stateChange = AudioEventEmitter.addListener('audioStateChanged', ev => {
      console.log('audioStateChanged: ' + ev.state);
      this.updateState(ev.state);
    });
    AudioEngine.open(RNFS.DocumentDirectoryPath + '/' + this.state.filename)
      .then(result => console.log('AudioEngine::open ' + result))
      .catch(error => console.log('AudioEngine::open error ' + error));
  }
  updatePosition(position, duration) {
    console.log('updatePosition ' + position + ' Duration: ' + duration);
    this.setState({ currentTime: Math.floor(position) });
  }
  updateState(state) {
    this.setState({ currentState: state });
  }
  renderButton(title, onPress, active) {
    var style = active ? styles.activeButtonText : styles.buttonText;

    return (
      <TouchableHighlight style={styles.button} onPress={onPress}>
        <Text style={style}>{title}</Text>
      </TouchableHighlight>
    );
  }
  seek(p) {
    console.log('seeking% = ' + p);
    this.setState({ currentTime: p });
  }

  render() {
    let recordBtn;
    let playBtn;
    if (this.state.currentState === 'STATE_RECORD') {
      recordBtn = this.renderButton('STOP', () => {
        AudioEngine.stop();
      });
    } else {
      recordBtn = this.renderButton('RECORD', () => {
        AudioEngine.record();
      });
    }
    if (this.state.currentState === 'STATE_PlAY') {
      playdBtn = this.renderButton('STOP', () => {
        console.log('play stop button pushed');
        AudioEngine.stop();
      });
    } else {
      playBtn = this.renderButton('PLAY', () => {
        console.log('play button pushed');
        AudioEngine.play();
      });
    }
    return (
      <View style={styles.container}>
        <View style={styles.controls}>
          {recordBtn}
          <Slider onValueChange={p => this.seek(p)} value={this.state.currentTime} minimumValue={0} maximumValue={100} step={1} style={styles.slider} />
          <Text style={styles.progressText}>{this.state.currentTime}s</Text>
          {playBtn}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column'
  },
  progressText: {
    paddingTop: 50,
    fontSize: 50
  },
  slider: {
    width: '90%'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
});
