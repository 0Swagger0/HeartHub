import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Lottie from "lottie-react-native";

// firebase database
import { getDatabase, set, ref, onValue } from "firebase/database";
import { App, Auth } from "../Firebase";
import {
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import AnimatedLoader from "react-native-animated-loader";

export default function Login({ navigation }) {
  //usestate
  const [phoneNumber, SetPhoneNumber] = useState("");
  const [OTP, setOTP] = useState("");
  const [checkOTPsend, setCheckOTPsend] = useState(false);
  const [verificationId, setVerificationId] = useState();
  const [progress, setProgress] = useState(false);
  const [uid, setUid] = useState("");

  //recaptcha
  const recaptchaVerifier = useRef(null);

  //getting phone number
  function getPhoneNumber() {
    if (phoneNumber.length == "") {
      Alert.alert("Please enter your phone number");
    } else if (phoneNumber.length !== 10) {
      Alert.alert("please provide valid phone number");
    } else {
      PhoneAuthentication();
    }
  }

  // phone authentication
  function PhoneAuthentication() {
    const phoneProvider = new PhoneAuthProvider(Auth);
    phoneProvider
      .verifyPhoneNumber("+91" + phoneNumber, recaptchaVerifier.current)
      .then(setVerificationId);
    Alert.alert("OTP sent successfully");
    setCheckOTPsend(true);
  }

  // get otp verification
  function getOTPVerification() {
    if (OTP.length == "") {
      Alert.alert("Please enter OTP");
    } else if (OTP.length !== 6) {
      Alert.alert("Please enter valide OTP");
    } else {
      OTPAuthentication();
    }
  }

  // otp authentication
  function OTPAuthentication() {
    const phoneOTP = PhoneAuthProvider.credential(verificationId, OTP);
    signInWithCredential(Auth, phoneOTP)
      .then(() => {
        navigation.replace("Details");
      })
      .catch(() => {
        Alert.alert("Wrong OTP");
      });
  }

  return (
    <View className="flex-1 justify-center self-center">
      {/* captcha verify*/}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={App.options}
      />

      {/* progress spinner */}
      <AnimatedLoader
        visible={progress}
        overlayColor="rgba(255,255,255,0.75)"
        source={require("../Animation/heart.json")}
        animationStyle={styles.lottie}
        speed={1}
      ></AnimatedLoader>

      <View className="flex-col">
        {/* Lottine Animation */}
        <View
          style={{
            height: 200,
            width: 300,
            alignSelf: "center",
          }}
        >
          <Lottie
            source={require("../Animation/44972-couple-chating.json")}
            autoPlay
            loop
          />
        </View>

        <View className="flex-col">
          <Text className="text-gray-600 font-bold text-lg text-center">
            Talk with your favourite person
          </Text>

          {checkOTPsend == false ? (
            <View>
              <View
                style={{
                  width: 300,
                  display: "flex",
                  flexDirection: "row",
                  borderWidth: 1,
                  alignItems: "center",
                  borderRadius: 5,
                  marginTop: 20,
                  borderColor: "#DC143C",
                }}
              >
                <Text className="text-gray-600 text-xs ml-3">+91 |</Text>

                <TextInput
                  style={{
                    padding: 5,
                    fontSize: 13,
                    paddingEnd: 100,
                    color: "#808080",
                  }}
                  keyboardType="number-pad"
                  placeholder="Phone number"
                  onChangeText={(text) => SetPhoneNumber(text)}
                />
              </View>

              <View className="flex-col mt-2 w-60">
                <Text className="text-gray-600 text-sm ">
                  I agree to the terms and condition and the privacy policy
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  width: 300,
                  borderRadius: 5,
                  height: 35,
                  marginTop: 20,
                  padding: 2,
                  alignSelf: "center",
                  justifyContent: "center",
                  backgroundColor: "#DC143C",
                }}
                onPress={getPhoneNumber}
              >
                <Text className="text-white text-sm font-bold text-center">
                  Send OTP
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // OTP input
            <View>
              <View
                style={{
                  width: 300,
                  display: "flex",
                  flexDirection: "row",
                  borderWidth: 1,
                  alignItems: "center",
                  borderRadius: 5,
                  marginTop: 20,
                  borderColor: "#DC143C",
                }}
              >
                <TextInput
                  style={{
                    padding: 5,
                    fontSize: 13,
                    marginLeft: 5,
                    paddingEnd: 100,
                    color: "#808080",
                  }}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                  onChangeText={(text) => setOTP(text)}
                />
              </View>
              <TouchableOpacity
                style={{
                  width: 300,
                  borderRadius: 5,
                  height: 35,
                  marginTop: 20,
                  padding: 2,
                  alignSelf: "center",
                  justifyContent: "center",
                  backgroundColor: "#DC143C",
                }}
                onPress={getOTPVerification}
              >
                <Text className="text-white text-sm font-bold text-center">
                  Verify OTP
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
});
