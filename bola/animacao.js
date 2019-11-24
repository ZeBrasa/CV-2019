// Uma esfera a saltar dentro de uma sala. Paredes são animadas.
// Paredes emitem um som quando há colisão
// Apenas uma fonte de luz
// É possivel mover o cenário com as seta dos teclado
(function() {

    //variaveis
    var camera, scene, renderer,
        esfera = [], planes = {}, player = null,
        windowWidth = window.innerWidth-100,
        windowHeight = window.innerHeight-100,
        windowDepth = 1000,
        maxwidth = windowWidth/2,
        maxheight = windowHeight/2,
        maxdepth = windowDepth/2,
        esferaRaio = 30,
        planoStartTime = 400,
        planoStartOpacity = 0.4,
        animating = false;


    //localização do plano
    var planeLocation = {
        LEFT: 0,
        RIGHT: 1,
        TOP: 2,
        BOTTOM: 3,
        BACK: 4
    };


    //função plano
    function Plane(mesh) {
        this.mesh = mesh;
        this.timeleft = planoStartTime;
    
        this.reset = function () {
            this.timeleft = planoStartTime;
            this.mesh.material.opacity = planoStartOpacity;
        }
    
        this.updateMesh = function( elapsed ) {
            // Verifica se ainda há tempo da animação
            if (this.timeleft > 0)
                this.timeleft -= elapsed;
            
            // depois de verificar se houve subtração do tempo, verifica de novo
            if (this.timeleft > 0) {
                // opacity = OpacidadeOriginal * timeleft / starttime
                this.mesh.material.opacity = planoStartOpacity + (1.0 - planoStartOpacity) * (this.timeleft / planoStartTime);
            }
            else {
                this.mesh.material.opacity = planoStartOpacity;
            }
        }
    }
    
    function Esfera(mesh) {
        this.mesh = mesh;
        //direção aleatória
        this.direction = [ 
            Math.round(Math.random()) == 1 ? 1 : -1, 
            Math.round(Math.random()) == 1 ? 1 : -1,
            Math.round(Math.random()) == 1 ? 1 : -1
        ];
    
        // Velocidade aleatória
        this.speed = Math.random() * 200 + 400;

        //saber onde está
        this.updatePosition = function (elapsed) {
            this.mesh.position.x += this.direction[0] * (elapsed / 1000.0 * this.speed);
            this.mesh.position.y += this.direction[1] * (elapsed / 1000.0 * this.speed);
            this.mesh.position.z += this.direction[2] * (elapsed / 1000.0 * this.speed);
        }

        //Colisões
        this.updateCollision = function() {
            if (this.mesh.position.x >= (maxwidth-esferaRaio)) {
                hitPlane(planeLocation.RIGHT);
                this.direction[0] = -1;
            }
            else if (this.mesh.position.x <= -(maxwidth-esferaRaio)) {
                hitPlane(planeLocation.LEFT);
                this.direction[0] = 1;
            }
    
            if (this.mesh.position.y >= (maxheight-esferaRaio)) {
                hitPlane(planeLocation.TOP);
                this.direction[1] = -1;
            }
            else if (this.mesh.position.y <= -(maxheight-esferaRaio)) {
                hitPlane(planeLocation.BOTTOM);
                this.direction[1] = 1;
            }
    
            if (this.mesh.position.z >= maxdepth) {
                this.direction[2] = -1;
            }
            else if (this.mesh.position.z <= -maxdepth) {
                hitPlane(planeLocation.BACK);
                this.direction[2] = 1;
            }
        }
    }

    //jogador (setas)
    function Player() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        //movimento e direção do plano
        this.toggleMovement = function (keyCode, directionBool) {
            switch (keyCode) {
                case 37:  // Left arrow
                case 65:  // 'a'
                    this.left = directionBool;
                    break;
                case 38:  // Up arrow
                case 87:  // 'w'
                    this.forward = directionBool;
                    break;
                case 39:  // Right arrow
                case 68:  // 'd'
                    this.right = directionBool;
                    break;
                case 40:  // Down arrow
                case 83:  // 's'
                    this.backward = directionBool;
                    break;

            }
        }

        //saber onde está o plano movido pelo jogador
        this.updatePosition = function (elapsed) {
            var curPosX = camera.position.x;
            var curPosZ = camera.position.z;
            var curRot = camera.rotation.y;

            var tr = 5.0;
            var rot = 0.025;

            //se avançou
            if (this.forward) {
                curPosX -= Math.sin(-curRot) * -tr;
                curPosZ -= Math.cos(-curRot) * tr;
            } // se recuou
            else if (this.backward) {
                curPosX -= Math.sin(curRot) * -tr;
                curPosZ += Math.cos(curRot) * tr;
            }
            //se virou para a esquerda
            if (this.left) {
                curRot += rot;
            } //se virou para a direita
            else if (this.right) {
                curRot -= rot;
            }

            camera.rotation.y = curRot;
            camera.position.x = curPosX;
            camera.position.z = curPosZ;
        }

        // key events.
        var closure = this;
        var startMoveEvent = function(keyEvent) {
            console.log('Key down ' + keyEvent.keyCode);
            closure.toggleMovement(keyEvent.keyCode, true);
        }

        var endMoveEvent = function(keyEvent) {
            console.log('Key up ' + keyEvent.keyCode);
            closure.toggleMovement(keyEvent.keyCode, false);
        }
        //listener do evento da key
        document.addEventListener('keydown', startMoveEvent);
        document.addEventListener('keyup', endMoveEvent);
    }
    
    function init() {

        //https://threejs.org/docs/#api/en/scenes/Scene

        scene = new THREE.Scene();
    
        camera = new THREE.PerspectiveCamera( 45, windowWidth / windowHeight, 1, 10000 );
        camera.position.z = 2000;

        //foco de luz
        var pointLight = new THREE.PointLight(0xffffff);  //luz branca
        pointLight.position.x = maxwidth - 50;
        pointLight.position.y = maxheight - 50;
        pointLight.position.z = maxdepth - 50;
        scene.add( pointLight );
    
        for (var i = 0; i < 1; i++) {
            var geometry = new THREE.SphereGeometry( esferaRaio, 10, 10);
            var material = new THREE.MeshLambertMaterial( { color: 0xff0000 } ); //vermelho
        
            esfera[i] = new Esfera ( new THREE.Mesh( geometry, material ) ); //Objecto esfera
    
            scene.add( esfera[i].mesh );
        }

        //iniciar planes
        initPlanes();
        player = new Player();
        
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize( windowWidth, windowHeight );
        //render por area
        var renderarea = document.getElementById('render-area');
        if (renderarea.hasChildNodes())
            renderarea.removeChild(renderarea.childNodes[0]);
        renderarea.appendChild(renderer.domElement);
    
        lastTime = new Date();
    }

    function initPlanes() {
        initPlane(planeLocation.TOP);
        initPlane(planeLocation.BOTTOM);
        initPlane(planeLocation.RIGHT);
        initPlane(planeLocation.LEFT);
        initPlane(planeLocation.BACK);
    }

    //inicio dos planos
    function initPlane( planeLoc ) {
        var w, h, posxx = 0, posyy = 0, poszz = 0, rotxx = 0, rotyy = 0, rotzz = 0;
    
        switch (planeLoc) {
            case planeLocation.BACK:
                w = windowWidth;
                h = windowHeight;
                poszz = -maxdepth;
                break;
            case planeLocation.LEFT:
                w = windowDepth;
                h = windowHeight;
                posxx = -maxwidth;
                rotyy = Math.PI/2;
                break;
            case planeLocation.RIGHT:
                w = windowDepth;
                h = windowHeight;
                posxx = maxwidth;
                rotyy = -Math.PI/2;
                break;
            case planeLocation.BOTTOM:
                w = windowWidth;
                h = windowDepth;
                posyy = -maxheight;
                rotxx = -Math.PI/2;
                break;
            case planeLocation.TOP:
                w = windowWidth;
                h = windowDepth;
                posyy = maxheight;
                rotxx = Math.PI/2;
                break;
        }
    
        geometry = new THREE.PlaneGeometry( w, h );
        material = new THREE.MeshLambertMaterial( { color: 0x0000ff, opacity: planeStartOpacity, transparent: true } );
        planeMesh = new THREE.Mesh( geometry, material );
        planeMesh.position.x = posxx;
        planeMesh.position.y = posyy;
        planeMesh.position.z = poszz;
        planeMesh.rotation.x = rotxx;
        planeMesh.rotation.y = rotyy;
        planeMesh.rotation.z = rotzz;
    
        var thePlane = new Plane ( planeMesh );
        planes[planeLoc] = thePlane;
        
        scene.add( thePlane.mesh );
    }

    //função quando bate num dos plano
    function hitPlane(planeLoc) {
        planes[planeLoc].reset();
        var wallsound = new Audio('message.ogg');
        wallsound.play();
    }
    
    var lastTime = 0;

    //função animação
    function animate() {
        if (animating) {
            var now = new Date();
            var elapsed = now.getTime() - lastTime.getTime();
            lastTime = now;
    
            for (var i = 0; i < esfera.length; i++) {
                esfera[i].updateCollision();
                esfera[i].updatePosition(elapsed);
            }
    
            for (var i in planes) {
                planes[i].updateMesh(elapsed);
            }

            player.updatePosition(elapsed);

            // note: three.js includes requestAnimationFrame shim
            window.animationId = requestAnimationFrame( animate );
            render();
        } 
    }
    
    function render() {
        renderer.render( scene, camera );
    }

    var animacao = function() {};

    animacao.prototype.start = function() {
        if (window.animationId !== null)
            cancelAnimationFrame(window.animationId);
        init();
        animating = true;
        animate();
    }

    animacao.prototype.stop = function() {
        animating = false;
    }

    window.animacao = new animacao();
})();
