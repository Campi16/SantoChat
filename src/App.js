import React, { useState, useRef } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

//hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { signInWithCredential } from "firebase/auth";

firebase.initializeApp({
  //tvoje konfiguracije sa firebase-a
  apiKey: "AIzaSyDf5K0aeZnblkyn-cUiU09T9eKhlhI3Ojk",
  authDomain: "santo-chat.firebaseapp.com",
  projectId: "santo-chat",
  storageBucket: "santo-chat.appspot.com",
  messagingSenderId: "1050666193494",
  appId: "1:1050666193494:web:61d0edd93e355dd60ea1f7",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

//aplikacija
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>
      {/*Ako je user prijavljen ide u chat, ako nije ide na SingIn*/}
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

//SignIn
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return <button onClick={signInWithGoogle}>Sing in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

//ChatRoom
function ChatRoom() {
  {
    /**stvaranje sekcije message u firestoru. Query Služi za pohranu poruka te ih slaže po redu*/
  }
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behaivor: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
